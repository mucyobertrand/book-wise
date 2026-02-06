import React from "react";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { approveUser, rejectUser } from "@/lib/admin/actions/user";

const AccountRequestPage = async () => {
  const pendingUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "PENDING"))
    .orderBy(desc(users.createdAt))
    .limit(50);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Account Requests</h2>
      </div>

      <div className="mt-7 w-full overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light-300 text-light-500">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">University ID</th>
              <th className="py-3 pr-4">Requested</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((u) => (
              <tr key={u.id} className="border-b border-light-300">
                <td className="py-3 pr-4 font-medium text-dark-400">
                  {u.fullName}
                </td>
                <td className="py-3 pr-4 text-dark-200">{u.email}</td>
                <td className="py-3 pr-4 text-dark-200">{u.universityId}</td>
                <td className="py-3 pr-4 text-dark-200">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <form action={async () => {
                      "use server";
                      await approveUser(u.id);
                    }}>
                      <Button className="confirm-approve">Approve</Button>
                    </form>

                    <form action={async () => {
                      "use server";
                      await rejectUser(u.id);
                    }}>
                      <Button className="confirm-reject">Reject</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {pendingUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-light-500">
                  No account requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AccountRequestPage;
