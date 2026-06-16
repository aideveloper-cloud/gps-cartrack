import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { toggleUserActive } from "@/app/actions/users";
import { formatDate } from "@/lib/format";
import { AddUserForm } from "./AddUserForm";

export default async function UsersPage() {
  await requireRole(ROLES.ADMIN);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ผู้ใช้งาน</h1>

      <AddUserForm />

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th">ชื่อ</th>
              <th className="th">อีเมล</th>
              <th className="th">บทบาท</th>
              <th className="th">สถานะ</th>
              <th className="th">สร้างเมื่อ</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="td font-medium">{u.name}</td>
                <td className="td">{u.email}</td>
                <td className="td">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="td">
                  <span className={`badge ${u.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                    {u.active ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="td">{formatDate(u.createdAt)}</td>
                <td className="td">
                  <form action={toggleUserActive.bind(null, u.id)}>
                    <button className="text-sm text-brand-600 hover:underline">
                      {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
