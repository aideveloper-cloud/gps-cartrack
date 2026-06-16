import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ORDER_STATUS, ROLES, STATUS_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (status && status in STATUS_LABELS) where.status = status;
  // Drivers only see orders assigned to them.
  if (user.role === ROLES.DRIVER) where.driverId = user.id;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { vehicle: true, driver: true, items: true },
  });

  const filters = [
    { label: "ทั้งหมด", value: "" },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ใบจ่ายสินค้า</h1>
        {(user.role === ROLES.ISSUER || user.role === ROLES.ADMIN) && (
          <Link href="/orders/new" className="btn-primary">
            + สร้างใบจ่ายสินค้า
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status ?? "") === f.value;
          const href = f.value ? `/orders?status=${f.value}` : "/orders";
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`badge ${active ? "bg-brand-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th">เลขที่</th>
              <th className="th">ลูกค้า</th>
              <th className="th">รายการ</th>
              <th className="th">สถานะ</th>
              <th className="th">รถ/คนขับ</th>
              <th className="th">สร้างเมื่อ</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td className="td text-center text-gray-400" colSpan={7}>
                  ไม่มีรายการ
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="td font-medium">{o.code}</td>
                  <td className="td">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.deliveryAddress.slice(0, 40)}…</div>
                  </td>
                  <td className="td">{o.items.length} รายการ</td>
                  <td className="td">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="td">
                    {o.vehicle ? o.vehicle.plate : "-"}
                    {o.driver ? ` / ${o.driver.name}` : ""}
                  </td>
                  <td className="td">{formatDateTime(o.createdAt)}</td>
                  <td className="td">
                    <Link href={`/orders/${o.id}`} className="text-brand-600 hover:underline">
                      เปิด
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
