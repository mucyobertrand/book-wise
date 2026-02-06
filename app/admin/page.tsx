import React from "react";
import Link from "next/link";
import { db } from "@/database/drizzle";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { users, books, borrowRecords } from "@/database/schema";
import type { InferSelectModel } from 'drizzle-orm';
import { formatDate } from "@/lib/utils";
import config from "@/lib/config";
import Image from "next/image";
import calendarIcon from "../../public/icons/admin/calendar.png";

type User = InferSelectModel<typeof users>;
type Book = InferSelectModel<typeof books>;

type BorrowRecordWithDetails = {
  id: string;
  bookTitle: string;
  userName: string;
  borrowDate: Date;
  dueDate: Date;
  coverUrl: string | null;
  coverColor: string | null;
};

type DashboardData = {
  stats: {
    borrowedBooks: number;
    totalUsers: number;
    totalBooks: number;
  };
  recentBorrows: BorrowRecordWithDetails[];
  pendingUsers: User[];
  deltas: {
    borrowedBooks: number;
    totalUsers: number;
    totalBooks: number;
  };
};

const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const now = new Date();
    const last7Start = new Date(now);
    last7Start.setDate(now.getDate() - 7);
    const prev7Start = new Date(now);
    prev7Start.setDate(now.getDate() - 14);
    const prev7End = new Date(now);
    prev7End.setDate(now.getDate() - 7);

    // Fetch all the data in parallel
    const [
      borrowedBooksCount,
      totalUsersCount,
      totalBooksCount,
      pendingUsers,
      borrowedLast7,
      borrowedPrev7,
      usersLast7,
      usersPrev7,
      booksLast7,
      booksPrev7
    ] = await Promise.all([
      // Count borrowed books (not returned yet)
      db
        .select({ count: count() })
        .from(borrowRecords)
        .where(eq(borrowRecords.status, 'BORROWED')),

      // Count total users
      db
        .select({ count: count() })
        .from(users),

      // Count total books
      db
        .select({ count: count() })
        .from(books),

      // Get pending user registrations
      db
        .select()
        .from(users)
        .where(eq(users.status, 'PENDING'))
        .orderBy(desc(users.createdAt))
        .limit(5),

      // Borrowed records created in last 7 days
      db
        .select({ count: count() })
        .from(borrowRecords)
        .where(
          and(
            eq(borrowRecords.status, 'BORROWED'),
            sql`${borrowRecords.createdAt} >= ${last7Start} AND ${borrowRecords.createdAt} < ${now}`
          )
        ),
      // Borrowed records created in previous 7 days
      db
        .select({ count: count() })
        .from(borrowRecords)
        .where(
          and(
            eq(borrowRecords.status, 'BORROWED'),
            sql`${borrowRecords.createdAt} >= ${prev7Start} AND ${borrowRecords.createdAt} < ${prev7End}`
          )
        ),

      // Users created in last 7 days
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.createdAt} >= ${last7Start} AND ${users.createdAt} < ${now}`),
      // Users created in previous 7 days
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.createdAt} >= ${prev7Start} AND ${users.createdAt} < ${prev7End}`),

      // Books created in last 7 days
      db
        .select({ count: count() })
        .from(books)
        .where(sql`${books.createdAt} >= ${last7Start} AND ${books.createdAt} < ${now}`),
      // Books created in previous 7 days
      db
        .select({ count: count() })
        .from(books)
        .where(sql`${books.createdAt} >= ${prev7Start} AND ${books.createdAt} < ${prev7End}`)
    ]);
    

    // Get recent borrow records
    const recentBorrowsResult = await db
      .select({
        id: borrowRecords.id,
        bookTitle: books.title,
        userName: users.fullName,
        borrowDate: borrowRecords.borrowDate,
        dueDate: borrowRecords.dueDate,
        coverUrl: books.coverUrl,
        coverColor: books.coverColor
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .innerJoin(users, eq(borrowRecords.userId, users.id))
      .orderBy(desc(borrowRecords.borrowDate))
      .limit(5);

    // Convert string dates to Date objects and filter out any null values
    const recentBorrows = recentBorrowsResult
      .filter(record => record.borrowDate && record.dueDate)
      .map(record => ({
        ...record,
        borrowDate: new Date(record.borrowDate as string | number | Date),
        dueDate: new Date(record.dueDate as string | number | Date),
        coverUrl: record.coverUrl,
        coverColor: record.coverColor
      }));

    return {
      stats: {
        borrowedBooks: borrowedBooksCount[0]?.count || 0,
        totalUsers: totalUsersCount[0]?.count || 0,
        totalBooks: totalBooksCount[0]?.count || 0,
      },
      recentBorrows,
      pendingUsers,
      deltas: {
        borrowedBooks: (borrowedLast7[0]?.count || 0) - (borrowedPrev7[0]?.count || 0),
        totalUsers: (usersLast7[0]?.count || 0) - (usersPrev7[0]?.count || 0),
        totalBooks: (booksLast7[0]?.count || 0) - (booksPrev7[0]?.count || 0),
      }
    };
  } catch (error) {
    // Silently handle database connection errors
    if (error) {
      // Database connection failed - returning empty data
    }
    return {
      stats: {
        borrowedBooks: 0,
        totalUsers: 0,
        totalBooks: 0,
      },
      recentBorrows: [],
      pendingUsers: [],
      deltas: {
        borrowedBooks: 0,
        totalUsers: 0,
        totalBooks: 0,
      }
    };
  }
};

const Page = async () => {
  let dashboardData;
  let recentBooks: Book[] = [];
  
  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    dashboardData = {
      stats: { borrowedBooks: 0, totalUsers: 0, totalBooks: 0 },
      deltas: { borrowedBooks: 0, totalUsers: 0, totalBooks: 0 },
      recentBorrows: [],
      pendingUsers: []
    };
  }

  try {
    recentBooks = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Error fetching recent books:', error);
    recentBooks = [];
  }

  const { stats, deltas, recentBorrows = [], pendingUsers = [] } = dashboardData;
  return (
    <section>
      {/* Database Connection Status */}
      {recentBooks.length === 0 && (
        <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
          <p className="text-sm">
            ⚠️ <strong>Database Connection Issue:</strong> Unable to connect to the database. 
            Please check your internet connection and try again later.
          </p>
        </div>
      )}
      
      {/* Cards */}
      {/* <span className="text-lg">▲</span> */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-6 bg-white px-5 py-4 rounded-2xl">
          <div className=" flex flex-row items-center gap-3">
            <p>Borrowed Books</p>
            <p className={`${deltas.borrowedBooks >= 0 ? 'text-[#2CC171]' : 'text-[#E27233]'} text-sm`}>
              <span className="text-xs">{deltas.borrowedBooks >= 0 ? '▲' : '▼'}</span>
              {" "}{Math.abs(deltas.borrowedBooks)}
            </p>
          </div>
          <p className="text-2xl font-semibold">{stats.borrowedBooks}</p>
        </div>
        <div className="flex flex-col gap-6 bg-white px-5 py-4 rounded-2xl">
          <div className=" flex flex-row items-center gap-3">
            <p>Total Users</p>
            <p className={`${deltas.totalUsers >= 0 ? 'text-[#2CC171]' : 'text-[#E27233]'} text-sm`}>
              <span className="text-xs">{deltas.totalUsers >= 0 ? '▲' : '▼'}</span>
              {" "}{Math.abs(deltas.totalUsers)}
            </p>
          </div>
          <p className="text-2xl font-semibold">{stats.totalUsers}</p>
        </div>
        <div className="flex flex-col gap-6 bg-white px-5 py-4 rounded-2xl">
          <div className=" flex flex-row items-center gap-3">
            <p>Total Books</p>
            <p className={`${deltas.totalBooks >= 0 ? 'text-[#2CC171]' : 'text-[#E27233]'} text-sm`}>
              <span className="text-xs">{deltas.totalBooks >= 0 ? '▲' : '▼'}</span>
              {" "}{Math.abs(deltas.totalBooks)}
            </p>
          </div>
          <p className="text-2xl font-semibold">{stats.totalBooks}</p>
        </div>
      </div>

      {/* <Link href="/admin/books/new" className="add-new-book_btn">
        <div>
          <img src="/icons/upload.svg" alt="add" className="size-6" />
        </div>
        <div>
          <p>Add a new book</p>
          <p className="text-light-500 text-sm">Create and manage library content</p>
        </div>
      </Link> */}
    <div className="grid grid-cols-2 max-lg:grid-cols-1 max-md:grid-cols-1 gap-12">

      <div className="flex flex-col max-md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-4">Borrow Requests</h3>
          {recentBorrows.length > 0 ? (
            <div className="space-y-4">
              {recentBorrows.map((record) => (
                <div key={record.id} className="border-b pb-4 flex gap-4 items-start">
                  <div className="w-16 flex-shrink-0">
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden">
                      {record.coverUrl ? (
                        (() => {
                          const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
                          const src = record.coverUrl!.startsWith("http")
                            ? record.coverUrl!
                            : `${endpoint}/${String(record.coverUrl).replace(/^\//, "")}`;
                          return (
                            <img
                              src={src}
                              alt={record.bookTitle}
                              className="size-full object-cover"
                            />
                          );
                        })()
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: record.coverColor || '#f3f4f6' }}
                        ></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1E293B] text-lg">{record.bookTitle}</p>
                    <p className="text-sm text-[#64748B]">
                      Borrowed by: {record.userName}
                    </p>
                    <p className="text-xs text-[#3A354E]">Due: {formatDate(record.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent borrows</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-4">Account Requests</h3>
          {pendingUsers.length > 0 ? (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="border-b pb-2">
                  <p className="font-medium text-lg text-[#1E293B]">{user.fullName}</p>
                  <p className="text-sm text-[#64748B]">{user.email}</p>
                  <p className="text-xs text-[#3A354E]">Registered: {formatDate(user.createdAt || undefined)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending user registrations</p>
          )}
        </div>
       </div>

       <div className="mt-8 bg-white p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Recently Added Books</h1>
          <div className="bg-[#F8F8FF] px-3 py-2 rounded-xl">
            <Link href="admin/books" className="text-[#25388C] text-md font-semibold">View All</Link>
          </div>
        </div>
        <div className="flex flex-col gap-6 mt-6">
          
        <Link href="/admin/books/new" className="add-new-book_btn mt-[-4px]">
          <div>
            <img src="/icons/upload.svg" alt="add" className="size-6" />
          </div>
          <div>
            <p className="text-[#1E293B]">Add a new book</p>
            <p className="text-light-500 text-sm">Create and manage library content</p>
          </div>
        </Link>
        {recentBooks.map((b) => (
          <div key={b.id} className="flex gap-6 items-start">
            <div className="shrink-0">
              <div className="w-16 h-20 rounded bg-gray-100 overflow-hidden">
                  {b.coverUrl ? (
                    (() => {
                      const src = b.coverUrl.startsWith("http")
                        ? b.coverUrl
                        : `${config.env.imagekit.urlEndpoint}/${b.coverUrl.replace(/^\//, "")}`;
                      return (
                        <img
                          src={src}
                              alt={b.title}
                              className="h-full w-full object-cover"
                            />
                          );
                        })()
                  ) : (
                    <div
                      className="size-full"
                      style={{ backgroundColor: b.coverColor || "#f3f4f6" }}
                    />
                  )}
              </div>
            </div>
            <div className="flex-1 ml-[-4px]">
              <h3 className="text-xl font-bold text-[#1E293B]">{b.title}</h3>
              <div className="flex flex-row items-center gap-2 my-1">
                <p className="text-md text-[#64748B]">{b.author}</p>
                <p className="text-md text-[#64748B]">{b.genre}</p>
              </div>
              <div className="flex items-center gap-2">
                <Image src={calendarIcon} alt="calendar" width={16} height={16}/>
                <p className="text-sm text-[#3A354E]">{formatDate(b.createdAt || undefined)}</p>
              </div>
            </div>
          </div>
        ))}
        </div>
       </div>
      </div>
    </section>
  );
};
export default Page;
