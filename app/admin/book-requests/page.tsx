import React from "react";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { markReturned } from "@/lib/admin/actions/borrow";
import { formatDate } from "@/lib/utils";

const BookRequestPage = async () => {
  const requests = await db
    .select({
      id: borrowRecords.id,
      status: borrowRecords.status,
      dueDate: borrowRecords.dueDate,
      userName: users.fullName,
      userEmail: users.email,
      bookTitle: books.title,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .orderBy(desc(borrowRecords.createdAt))
    .limit(50);

  const today = new Date();

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Borrow Requests</h2>
      </div>

      <div className="mt-7 w-full overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light-300 text-light-500">
              <th className="py-3 pr-4">Book</th>
              <th className="py-3 pr-4">User</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Due Date</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const isOverdue =
                r.status === "BORROWED" && r.dueDate && new Date(r.dueDate) < today;
              const badgeClasses =
                r.status === "RETURNED"
                  ? "bg-[#F0F9FF] text-[#026AA2]"
                  : isOverdue
                  ? "bg-[#FFF1F3] text-[#C01048]"
                  : "bg-[#F9F5FF] text-[#6941C6]";
              const label =
                r.status === "RETURNED" ? "Returned" : isOverdue ? "Overdue" : "Borrowed";

              return (
                <tr key={r.id} className="border-b border-light-300">
                  <td className="py-3 pr-4 font-medium text-dark-400">
                    {r.bookTitle}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="text-dark-400 font-medium">{r.userName}</span>
                      <span className="text-xs text-light-500">{r.userEmail}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClasses}`}>
                      {label}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-dark-200">{formatDate(r.dueDate)}</td>
                  <td className="py-3 pr-4">
                    {r.status === "BORROWED" && (
                      <form action={async () => {
                        "use server";
                        await markReturned(r.id);
                      }}>
                        <Button className="view-btn px-3 py-1">Mark Returned</Button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-light-500">
                  No borrow requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BookRequestPage;
