import { Link } from "react-router-dom";
import { useStore } from "../store";
import { ORDER_STATUS } from "../constants";
import { formatDateTime } from "../lib";

export function Jobs() {
  const { db, currentUser, claimJob } = useStore();

  const openJobs = db.orders
    .filter((o) => o.status === ORDER_STATUS.OPEN && !o.driverId)
    .sort((a, b) => (a.openedAt ?? 0) - (b.openedAt ?? 0));
  const myJobs = db.orders.filter(
    (o) => o.driverId === currentUser.id && [ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_TRANSIT].includes(o.status as any),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">งานที่เปิดรับ</h1>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">รอรับ ({openJobs.length})</h2>
        {openJobs.length === 0 ? (
          <p className="card text-center text-sm text-gray-400">ยังไม่มีงานเปิดรับตอนนี้</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {openJobs.map((o) => {
              const dirLink = o.pickupLat != null && o.deliveryLat != null
                ? `https://www.google.com/maps/dir/?api=1&origin=${o.pickupLat},${o.pickupLng}&destination=${o.deliveryLat},${o.deliveryLng}` : null;
              return (
                <div key={o.id} className="card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{o.code}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(o.openedAt)}</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-green-700">📍 รับ: {o.pickupAddress ?? "(ดูบนแผนที่)"}</div>
                    <div className="text-red-700">🏁 ส่ง: {o.deliveryAddress}</div>
                  </div>
                  <div className="text-xs text-gray-400">ลูกค้า {o.customerName} · {o.items.length} รายการ</div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => claimJob(o.id)} className="btn-primary flex-1">🙋 รับงานนี้</button>
                    {dirLink && <a href={dirLink} target="_blank" rel="noreferrer" className="btn-secondary">เส้นทาง</a>}
                    <Link to={`/orders/${o.id}`} className="btn-secondary">ดู</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-700">งานของฉัน ({myJobs.length})</h2>
        {myJobs.length === 0 ? (
          <p className="card text-center text-sm text-gray-400">ยังไม่มีงานที่รับไว้</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {myJobs.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="card block hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{o.code}</span>
                  <span className="badge bg-blue-100 text-blue-800">{o.status === ORDER_STATUS.IN_TRANSIT ? "กำลังส่ง" : "รอออกรถ"}</span>
                </div>
                <div className="mt-1 text-sm text-red-700">🏁 {o.deliveryAddress}</div>
                <div className="text-xs text-gray-400">ลูกค้า {o.customerName}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
