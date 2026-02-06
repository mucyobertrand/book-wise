import React from "react";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BookForm from "@/components/admin/forms/BookForm";

const Page = async ({ params }: { params: { id: string } }) => {
  const book = await db
    .select()
    .from(books)
    .where(eq(books.id, params.id))
    .limit(1)
    .then((res) => res[0]);

  if (!book) {
    return (
      <section className="w-full rounded-2xl bg-white p-7">
        <p className="text-light-500">Book not found</p>
      </section>
    );
  }

  return (
    <>
      <Button asChild className="back-btn">
        <Link href={`/admin/books/${book.id}`}>Go Back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <BookForm type="update" {...book} />
      </section>
    </>
  );
};

export default Page;
