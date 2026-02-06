"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import dayjs from "dayjs";
import { sendEmail } from "@/lib/workflow";
import { tplBorrowConfirmation } from "@/lib/email/templates";
import { users, books as Books } from "@/database/schema";
import { formatDate } from "@/lib/utils";

export type SearchParams = {
  query?: string;
  genre?: string;
  author?: string;
  minRating?: number;
  sortBy?: 'title' | 'author' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};

export const searchBooks = async (params: SearchParams) => {
  try {
    const {
      query = '',
      genre,
      author,
      minRating,
      sortBy = 'title',
      sortOrder = 'asc',
      limit = 10,
      offset = 0,
    } = params;

    const conditions = [];
    
    // Text search across title, author, and description
    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(books.title, searchTerm),
          ilike(books.author, searchTerm),
          ilike(books.description, searchTerm)
        )
      );
    }

    // Filter by genre if provided
    if (genre) {
      conditions.push(eq(books.genre, genre));
    }

    // Filter by author if provided
    if (author) {
      conditions.push(ilike(books.author, `%${author}%`));
    }

    // Filter by minimum rating if provided
    if (minRating !== undefined) {
      conditions.push(sql`${books.rating} >= ${minRating}`);
    }

    // Build the order by clause
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = books.title;
        break;
      case 'author':
        orderBy = books.author;
        break;
      case 'rating':
        orderBy = books.rating;
        break;
      case 'date':
        orderBy = books.createdAt;
        break;
      default:
        orderBy = books.title;
    }

    const result = await db
      .select()
      .from(books)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sortOrder === 'asc' ? orderBy : sql`${orderBy} DESC`)
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(conditions.length ? and(...conditions) : undefined)
      .then(res => Number(res[0]?.count || 0));

    return {
      success: true,
      data: {
        books: result,
        total: totalCount,
        hasMore: offset + result.length < totalCount,
      },
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'An error occurred while searching for books',
    };
  }
};

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
    const book = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length || book[0].availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available for borrowing",
      };
    }

    const dueDateObj = dayjs().add(7, "day").toDate();
    const dueDate = formatDate(dueDateObj);

    const record = await db.insert(borrowRecords).values({
      userId,
      bookId,
      dueDate,
      status: "BORROWED",
    });

    await db
      .update(books)
      .set({ availableCopies: book[0].availableCopies - 1 })
      .where(eq(books.id, bookId));

    const [bookRow] = await db.select().from(Books).where(eq(Books.id, bookId)).limit(1);
    const [userRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRow?.email && userRow?.fullName && bookRow?.title) {
      await sendEmail({
        email: userRow.email,
        subject: "Book borrowed confirmation",
        message: tplBorrowConfirmation({ fullName: userRow.fullName, bookTitle: bookRow.title, dueDate }),
      });
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(record)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error: "An error occurred while borrowing the book",
    };
  }
};
