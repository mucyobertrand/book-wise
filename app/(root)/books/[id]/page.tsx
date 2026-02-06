import React from "react";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BookOverview from "@/components/BookOverview";
import BookVideo from "@/components/BookVideo";
import BookList from "@/components/BookList";
import { desc } from "drizzle-orm";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const session = await auth();

  // Fetch data based on id
  const [bookDetails] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  const latestBooks = (await db
      .select()
      .from(books)
      .limit(6)
      .orderBy(desc(books.createdAt))) as Book[];  
  if (!bookDetails) redirect("/404");

  return (
    <>
      <BookOverview {...bookDetails} userId={session?.user?.id as string} />
      <section className="flex flex-row justify-between max-sm:flex-col gap-20">
      <div className="book-details w-[50%]">
        <div className="flex-[1.5]">
          <section className="flex flex-col gap-7">
            <h3>Video</h3>

            <BookVideo videoUrl={bookDetails.videoUrl} />
          </section>
          <section className="mt-10 flex flex-col gap-7">
            <h3>Summary</h3>

            <div className="space-y-5 text-xl text-light-100">
              {bookDetails.summary.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        {/*  SIMILAR*/}
      </div>
      <div className="mt-40 w-[50%]">
        <h3 className="text-left text-light-200 text-xl font-semibold">More similar books</h3>
      <BookList
        title=""
        books={latestBooks.slice(0, 6)}
        containerClassName="mt-18"
      />
      </div>
      </section>
    </>
  );
};
export default Page;
