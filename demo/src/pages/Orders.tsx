import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store";
import { ROLES, STATUS_LABELS } from "../constants";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../lib";

export function Orders() {
  const { db, role, currentUser } = useStore();
  const [sp] = useSearchParams();
  const status = sp.get("status") ?? "";

  let orders = [...db.orders].sort((a, b) => b.createdAt - a.createdAt);
  if (role === ROLES.DRIVER) orders = orders.filter((o) => o.driverId === currentUser.id);
  if (status && status in STATUS_LABELS) orders = orders.filter((o) => o.status === status);

  const veh = (id: string | null) => db.vehicles.find((v) => v.id === id);
  const usr = (id: string | null) => db.users.find((u) => u.id === id);

  const filters = [{ label: "ทั้งหมด", value: "" }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ใบจ่ายสินค้า</h1>
        {(role === ROLES.ISSUER || role === ROLES.ADMIN) && (
          <Link to="/orders/new" className="btn-primary">+ สร้างใบจ่ายสินค้า</Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = status === f.value;
          return (
            <Link
              key={f.value || "all"}
              to={f.value ? `/orders?status=${f.value}` : "/orders"}
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
              <th className="th">เลขที่</th><th className="th">ลูกค้า</th><th className="th">รายการ</th>
              <th className="th">สถานะ</th><th className="th">รถ/คนขับ</th><th className="th">สร้างเมื่อ</th><th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td className="td text-center text-gray-400" colSpan={7}>ไม่มีรายการ</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="td font-medium">{o.code}</td>
                  <td className="td">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-gray-400">{o.deliveryAddress.slice(0, 40)}…</div>
                  </td>
                  <td className="td">{o.items.length} รายการ</td>
                  <td className="td"><StatusBadge status={o.status} /></td>
                  <td className="td">{veh(o.vehicleId)?.plate ?? "-"}{usr(o.driverId) ? ` / ${usr(o.driverId)!.name}` : ""}</td>
                  <td className="td">{formatDateTime(o.createdAt)}</td>
                  <td className="td"><Link to={`/orders/${o.id}`} className="text-brand-600 hover:underline">เปิด</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
