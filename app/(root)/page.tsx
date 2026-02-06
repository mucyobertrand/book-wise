import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

type Book = InferSelectModel<typeof books>;

const Home = async () => {
  const session = await auth();

  let latestBooks: Book[] = [];
  try {
    latestBooks = (await db
      .select()
      .from(books)
      .limit(10)
      .orderBy(desc(books.createdAt))) as Book[];
  } catch (error) {
    // Silently handle database connection errors
    if (error) {
      // Database connection failed - returning empty books array
    }
  }

  return (
    <>
      {latestBooks.length > 0 && (
        <BookOverview {...latestBooks[0]} userId={session?.user?.id as string} />
      )}

      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />
    </>
  );
};

export default Home;
