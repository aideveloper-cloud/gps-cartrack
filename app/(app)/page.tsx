import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ORDER_STATUS, ROLES, STATUS_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();

  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;

  // Orders relevant to the current user / role.
  const where =
    user.role === ROLES.DRIVER
      ? { driverId: user.id, status: { in: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_TRANSIT] } }
      : user.role === ROLES.PICKER
        ? { status: { in: [ORDER_STATUS.BILLED, ORDER_STATUS.CHECKING] } }
        : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { vehicle: true, driver: true },
  });

  const tiles = [
    { key: ORDER_STATUS.BILLED, href: "/orders?status=BILLED" },
    { key: ORDER_STATUS.CHECKING, href: "/orders?status=CHECKING" },
    { key: ORDER_STATUS.OPEN, href: "/orders?status=OPEN" },
    { key: ORDER_STATUS.ACCEPTED, href: "/orders?status=ACCEPTED" },
    { key: ORDER_STATUS.IN_TRANSIT, href: "/orders?status=IN_TRANSIT" },
    { key: ORDER_STATUS.DELIVERED, href: "/orders?status=DELIVERED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-sm text-gray-500">สวัสดี {user.name} 👋</p>
        </div>
        {(user.role === ROLES.ISSUER || user.role === ROLES.ADMIN) && (
          <Link href="/orders/new" className="btn-primary">
            + สร้างใบจ่ายสินค้า
          </Link>
        )}
        {user.role === ROLES.DRIVER && (
          <Link href="/jobs" className="btn-primary">
            🙋 งานที่เปิดรับ
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.key} href={t.href} className="card transition hover:shadow-md">
            <div className="text-3xl font-bold text-gray-900">{countMap[t.key] ?? 0}</div>
            <div className="mt-1 text-xs text-gray-500">{STATUS_LABELS[t.key]}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {user.role === ROLES.DRIVER
              ? "งานจัดส่งของฉัน"
              : user.role === ROLES.PICKER
                ? "งานรอจัดสินค้า"
                : "ใบจ่ายล่าสุด"}
          </h2>
          <Link href="/orders" className="text-sm text-brand-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">ไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="th">เลขที่</th>
                  <th className="th">ลูกค้า</th>
                  <th className="th">สถานะ</th>
                  <th className="th">รถ/คนขับ</th>
                  <th className="th">สร้างเมื่อ</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="td font-medium">{o.code}</td>
                    <td className="td">{o.customerName}</td>
                    <td className="td">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="td">
                      {o.vehicle ? `${o.vehicle.plate}` : "-"}
                      {o.driver ? ` / ${o.driver.name}` : ""}
                    </td>
                    <td className="td">{formatDateTime(o.createdAt)}</td>
                    <td className="td">
                      <Link href={`/orders/${o.id}`} className="text-brand-600 hover:underline">
                        เปิด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
