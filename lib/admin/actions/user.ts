"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/workflow";
import { tplAccountApproved, tplAccountRejected } from "@/lib/email/templates";

export const approveUser = async (id: string) => {
  try {
    const updated = await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, id))
      .returning();
    const u = updated[0];
    if (u?.email && u?.fullName) {
      await sendEmail({
        email: u.email,
        subject: "Your BookWise account has been approved",
        message: tplAccountApproved({ fullName: u.fullName }),
      });
    }
    return { success: true, data: JSON.parse(JSON.stringify(u)) };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to approve user" };
  }
};

export const rejectUser = async (id: string) => {
  try {
    const updated = await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, id))
      .returning();
    const u = updated[0];
    if (u?.email && u?.fullName) {
      await sendEmail({
        email: u.email,
        subject: "Your BookWise account could not be approved",
        message: tplAccountRejected({ fullName: u.fullName }),
      });
    }
    return { success: true, data: JSON.parse(JSON.stringify(u)) };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to reject user" };
  }
};
