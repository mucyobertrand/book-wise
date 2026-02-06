"use server";

import { books } from "@/database/schema";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";

export const createBook = async (params: BookParams) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
      })
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while creating the book",
    };
  }
};

export const updateBook = async (
  params: { id: string } & BookParams,
) => {
  try {
    const updated = await db
      .update(books)
      .set({
        title: params.title,
        author: params.author,
        genre: params.genre,
        rating: params.rating,
        coverUrl: params.coverUrl,
        coverColor: params.coverColor,
        description: params.description,
        totalCopies: params.totalCopies,
        availableCopies: params.totalCopies,
        videoUrl: params.videoUrl,
        summary: params.summary,
      })
      .where(eq(books.id, params.id))
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated[0])),
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred while updating the book",
    };
  }
};
