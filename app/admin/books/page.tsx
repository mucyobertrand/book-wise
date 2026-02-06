import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc } from "drizzle-orm";
import config from "@/lib/config";
import { formatDate } from "@/lib/utils";

const Page = async () => {
  const result = await db
    .select()
    .from(books)
    .orderBy(desc(books.createdAt))
    .limit(100);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Books</h2>
        <Button className="bg-primary-admin" asChild>
          <Link href="/admin/books/new" className="text-white">
            + Create a New Book
          </Link>
        </Button>
      </div>

      <div className="mt-7 w-full overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light-300 text-light-500">
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Author</th>
              <th className="py-3 pr-4">Genre</th>
              <th className="py-3 pr-4">Rating</th>
              <th className="py-3 pr-4">Available</th>
              <th className="py-3 pr-4">Created</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.map((b) => (
              <tr key={b.id} className="border-b border-light-300">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-7 rounded bg-gray-100 overflow-hidden">
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
                          className="h-full w-full"
                          style={{ backgroundColor: b.coverColor || "#f3f4f6" }}
                        />
                      )}
                    </div>
                    <span className="font-medium text-dark-400">{b.title}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-dark-200">{b.author}</td>
                <td className="py-3 pr-4 text-dark-200">{b.genre}</td>
                <td className="py-3 pr-4 text-dark-200">{b.rating}</td>
                <td className="py-3 pr-4 text-dark-200">{b.availableCopies}</td>
                <td className="py-3 pr-4 text-dark-200">{formatDate(b.createdAt)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/books/${b.id}`} className="view-btn px-3 py-1">
                      View
                    </Link>
                    <Link href={`/admin/books/${b.id}/edit`} className="view-btn px-3 py-1">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {result.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-light-500">
                  No books found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Page;
