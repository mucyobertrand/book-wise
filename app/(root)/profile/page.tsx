import React from "react";
import Image from "next/image";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users, borrowRecords, books } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import BookList from "@/components/BookList";
import config from "@/lib/config";

const ProfilePage = async () => {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  let user: typeof users.$inferSelect | undefined;
  let borrowed: Book[] = [];

  if (userId) {
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    user = u;

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

  const statusLabel = user?.status === "APPROVED" ? "Verified Student" : user?.status === "REJECTED" ? "Rejected" : "Pending Verification";
  const cardSrc = user?.universityCard
    ? (user.universityCard.startsWith("http")
        ? user.universityCard
        : `${config.env.imagekit.urlEndpoint}/${user.universityCard.replace(/^\//, "")}`)
    : undefined;

  return (
    <section className="flex flex-col mb-5 justify-around md:flex-row max-md:items-center">
      <div className="relative flex h-[698px] w-[566px] flex-col gap-8 rounded-2xl bg-[#212637] px-8 py-4 text-xl md:h-[615px] md:w-[446px] md:gap-6">
        <div className="absolute top-[-22px] items-center mx-auto">
          <Image src="/images/frame.png" alt="profile" width={49} height={88} />
        </div>
        <div className="flex flex-row items-center gap-5 md:mt-[-15px]">
          <Image src="/images/profile.png" alt="profile" width={100} height={100} />
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <Image src="/images/verify.png" alt="verify" width={15} height={15} />
              <p className="text-light-100 text-[16px]">{statusLabel}</p>
            </div>
            <h3 className="text-[20px] text-white">{user?.fullName || "Guest"}</h3>
            <p className="text-[16px] text-light-100">{user?.email || ""}</p>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <p className="text-[18px] text-white">Student ID</p>
          <h3 className="text-2xl text-light-100">{user?.universityId ?? "-"}</h3>
        </div>

        {cardSrc && (
          <Image
            src={cardSrc}
            alt="University ID Card"
            width={400}
            height={400}
            className="mx-auto md:w-[350px] md:mb-5 md:h-[300px] object-contain"
          />
        )}
      </div>

      <div className="flex w-full flex-col justify-start items-start mt-12">
        <h3 className="text-2xl text-light-200">Borrowed Books</h3>
        {borrowed.length > 0 ? (
          <BookList title="Currently Borrowed" books={borrowed} containerClassName="mt-6" />
        ) : (
          <p className="mt-4 text-light-500">No borrowed books</p>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
