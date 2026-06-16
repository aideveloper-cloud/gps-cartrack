import { Link } from "react-router-dom";
import { useStore } from "../store";
import { ORDER_STATUS, ROLES, STATUS_LABELS } from "../constants";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../lib";

export function Dashboard() {
  const { db, role, currentUser } = useStore();

  const countMap: Record<string, number> = {};
  for (const o of db.orders) countMap[o.status] = (countMap[o.status] ?? 0) + 1;

  let orders = [...db.orders].sort((a, b) => b.createdAt - a.createdAt);
  if (role === ROLES.DRIVER)
    orders = orders.filter((o) => o.driverId === currentUser.id && [ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_TRANSIT].includes(o.status as any));
  else if (role === ROLES.PICKER)
    orders = orders.filter((o) => [ORDER_STATUS.BILLED, ORDER_STATUS.CHECKING].includes(o.status as any));
  orders = orders.slice(0, 8);

  const veh = (id: string | null) => db.vehicles.find((v) => v.id === id);
  const usr = (id: string | null) => db.users.find((u) => u.id === id);

  const tiles = [
    ORDER_STATUS.BILLED, ORDER_STATUS.CHECKING, ORDER_STATUS.OPEN,
    ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.DELIVERED,
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-sm text-gray-500">สวัสดี {currentUser.name} 👋</p>
        </div>
        {(role === ROLES.ISSUER || role === ROLES.ADMIN) && (
          <Link to="/orders/new" className="btn-primary">+ สร้างใบจ่ายสินค้า</Link>
        )}
        {role === ROLES.DRIVER && <Link to="/jobs" className="btn-primary">🙋 งานที่เปิดรับ</Link>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t} to={`/orders?status=${t}`} className="card transition hover:shadow-md">
            <div className="text-3xl font-bold text-gray-900">{countMap[t] ?? 0}</div>
            <div className="mt-1 text-xs text-gray-500">{STATUS_LABELS[t]}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {role === ROLES.DRIVER ? "งานจัดส่งของฉัน" : role === ROLES.PICKER ? "งานรอจัดสินค้า" : "ใบจ่ายล่าสุด"}
          </h2>
          <Link to="/orders" className="text-sm text-brand-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">ไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="th">เลขที่</th><th className="th">ลูกค้า</th><th className="th">สถานะ</th>
                  <th className="th">รถ/คนขับ</th><th className="th">สร้างเมื่อ</th><th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="td font-medium">{o.code}</td>
                    <td className="td">{o.customerName}</td>
                    <td className="td"><StatusBadge status={o.status} /></td>
                    <td className="td">{veh(o.vehicleId)?.plate ?? "-"}{usr(o.driverId) ? ` / ${usr(o.driverId)!.name}` : ""}</td>
                    <td className="td">{formatDateTime(o.createdAt)}</td>
                    <td className="td"><Link to={`/orders/${o.id}`} className="text-brand-600 hover:underline">เปิด</Link></td>
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
