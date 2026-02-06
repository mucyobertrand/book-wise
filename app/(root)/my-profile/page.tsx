import React from "react";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";
import BookList from "@/components/BookList";
import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  let borrowed: Book[] = [];
  if (userId) {
    const rows = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        genre: books.genre,
        rating: books.rating,
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
        description: books.description,
        coverColor: books.coverColor,
        coverUrl: books.coverUrl,
        videoUrl: books.videoUrl,
        summary: books.summary,
        createdAt: books.createdAt,
      })
      .from(borrowRecords)
      .innerJoin(books, eq(borrowRecords.bookId, books.id))
      .where(eq(borrowRecords.userId, userId))
      .orderBy(desc(borrowRecords.createdAt));
    borrowed = rows as unknown as Book[];
  }

  return (
    <>
      <form
        action={async () => {
          "use server";

          await signOut();
        }}
        className="mb-10"
      >
        <Button>Logout</Button>
      </form>

      <BookList title="Borrowed Books" books={borrowed} />
    </>
  );
};
export default Page;
