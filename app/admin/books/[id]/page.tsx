import React from "react";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import ArrowLeft from "@/public/icons/admin/arrow-left.png";
import Image from "next/image";
import edit from "@/public/icons/admin/edit-2.png";
import BookCover from "@/components/BookCover";
import { formatDate } from "@/lib/utils";
import BookVideo from "@/components/BookVideo";

const Page = async ({ params }: { params: { id: string } }) => {
  const bookId = params.id;
  const book = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
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
    <section className="w-full rounded-2xl p-7">
      <div className="flex w-fit items-center justify-start gap-1 rounded-lg bg-white px-4 py-2">
        <Image src={ArrowLeft} alt="Arrow left" width={24} height={24}/>
        <Link href="/admin/books">Go back</Link>
      </div>
      <div className="mt-2 grid grid-cols-2 items-center">
        <div className="flex h-[300px] w-[360px] items-center justify-center rounded-xl" style={{ backgroundColor: `${book.coverColor}A3` }}>
          <BookCover
            variant="regular"
            className="z-10 rotate-12"
            coverColor={book.coverColor}
            coverImage={book.coverUrl}
          />
        </div>
        <div className="ml-[-248px] flex h-full flex-col gap-5 px-4 py-16">
          <p className="text-lg text-[#64748B]">Created at: {formatDate(book.createdAt || new Date())}</p>
          <h2 className="text-3xl font-bold text-[#1E293B]">{book.title}</h2>
          <p className="text-xl text-[#3A354E]">By {book.author}</p>
          <p className="text-xl text-[#64748B]">{book.genre}</p>
          <Link href={`/admin/books/${bookId}/edit`} className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-[#25388C] py-2 text-lg text-white">
            <Image src={edit} alt="Edit" width={20} height={20} className="object-cover" />
            <p>Edit Book</p>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold text-[#1E293B]">Summary</h2>
          <p className="mt-6 text-lg font-semibold text-[#64748B]">{book.summary}</p>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold text-[#1E293B]">Video</h2>
          <BookVideo videoUrl={book.videoUrl} />
        </div>
      </div>
    </section>
  );
};

export default Page;
