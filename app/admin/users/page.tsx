import React from "react";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";

const UsersPage = async () => {
  const result = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(50);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Users</h2>
      </div>

      <div className="mt-7 w-full overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light-300 text-light-500">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">University ID</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Last Active</th>
              <th className="py-3 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {result.map((u) => (
              <tr key={u.id} className="border-b border-light-300">
                <td className="py-3 pr-4 font-medium text-dark-400">
                  {u.fullName}
                </td>
                <td className="py-3 pr-4 text-dark-200">{u.email}</td>
                <td className="py-3 pr-4 text-dark-200">{u.universityId}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${u.role === "ADMIN" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FDF2FA] text-[#C11574]"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${u.status === "APPROVED" ? "bg-[#ECFDF3] text-[#027A48]" : u.status === "REJECTED" ? "bg-[#FFF1F3] text-[#C01048]" : "bg-[#F9F5FF] text-[#6941C6]"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-dark-200">{formatDate(u.lastActivityDate as Date)}</td>
                <td className="py-3 pr-4 text-dark-200">{formatDate(u.createdAt as Date)}</td>
              </tr>
            ))}
            {result.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-light-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsersPage;
