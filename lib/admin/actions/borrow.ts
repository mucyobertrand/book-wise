"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import { tplReturnConfirmation } from "@/lib/email/templates";

export const markReturned = async (recordId: string) => {
  try {
    const record = await db
      .select({ bookId: borrowRecords.bookId, userId: borrowRecords.userId })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, recordId))
      .limit(1);

    if (!record.length) {
      return { success: false, message: "Borrow record not found" };
    }

    const bookId = record[0].bookId;
    const userId = record[0].userId;

    await db
      .update(borrowRecords)
      .set({ status: "RETURNED" })
      .where(eq(borrowRecords.id, recordId));

    await db
      .update(books)
      .set({ availableCopies: books.availableCopies + 1 })
      .where(eq(books.id, bookId));

    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user?.email && user?.fullName && book?.title) {
      await sendEmail({
        email: user.email,
        subject: "Book returned confirmation",
        message: tplReturnConfirmation({ fullName: user.fullName, bookTitle: book.title }),
      });
    }

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to update borrow record" };
  }
};
