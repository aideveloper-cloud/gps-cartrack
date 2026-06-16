import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../store";
import { ORDER_STATUS, ROLES } from "../constants";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../lib";
import MapPicker, { type LatLng } from "../components/MapPicker";

export function OrderDetail() {
  const { id } = useParams();
  const store = useStore();
  const { db, role, currentUser } = store;
  const order = db.orders.find((o) => o.id === id);

  if (!order) return <p className="text-gray-400">ไม่พบรายการ</p>;

  const prod = (pid: string) => db.products.find((p) => p.id === pid);
  const usr = (uid: string | null) => db.users.find((u) => u.id === uid);
  const veh = (vid: string | null) => db.vehicles.find((v) => v.id === vid);

  const isAdmin = role === ROLES.ADMIN;
  const isIssuer = role === ROLES.ISSUER;
  const isPicker = role === ROLES.PICKER;
  const isDriver = role === ROLES.DRIVER;
  const open = order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED;
  const mine = order.driverId === currentUser.id;

  const dirLink =
    order.pickupLat != null && order.deliveryLat != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${order.pickupLat},${order.pickupLng}&destination=${order.deliveryLat},${order.deliveryLng}`
      : null;

  return (
    <div className="space-y-6">
      <Link to="/orders" className="text-sm text-brand-600 hover:underline">← ใบจ่ายสินค้า</Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.code}</h1>
          <p className="text-sm text-gray-500">วางบิล {formatDateTime(order.createdAt)} โดย {usr(order.issuerId)?.name}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h2 className="mb-3 font-semibold text-gray-900">ข้อมูลลูกค้า / ปลายทาง</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <KV label="ลูกค้า" value={order.customerName} />
              <KV label="เบอร์โทร" value={order.customerPhone ?? "-"} />
              <div className="sm:col-span-2"><dt className="text-gray-500">ที่อยู่ปลายทาง</dt><dd className="font-medium">{order.deliveryAddress}</dd></div>
              {order.note && <div className="sm:col-span-2"><KV label="หมายเหตุ" value={order.note} /></div>}
            </dl>
          </div>

          {(order.pickupLat != null || order.deliveryLat != null || order.pickupAddress) && (
            <div className="card">
              <h2 className="mb-3 font-semibold text-gray-900">จุดรับ-ส่ง</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="font-medium text-green-800">📍 จุดรับ (ต้นทาง)</div>
                  <div>{order.pickupAddress ?? "-"}</div>
                  {order.pickupLat != null && <div className="text-xs text-gray-500">{order.pickupLat.toFixed(5)}, {order.pickupLng?.toFixed(5)}</div>}
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="font-medium text-red-800">🏁 จุดส่ง (ปลายทาง)</div>
                  <div>{order.deliveryAddress}</div>
                  {order.deliveryLat != null && <div className="text-xs text-gray-500">{order.deliveryLat.toFixed(5)}, {order.deliveryLng?.toFixed(5)}</div>}
                </div>
              </div>
              {dirLink && <a href={dirLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-brand-600 hover:underline">🗺️ เปิดเส้นทางใน Google Maps</a>}
            </div>
          )}

          <div className="card p-0">
            <h2 className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-900">รายการสินค้า</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr><th className="th">สินค้า</th><th className="th">SKU</th><th className="th">สั่ง</th><th className="th">เช็คได้</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="td">{prod(it.productId)?.name}</td>
                    <td className="td text-gray-400">{prod(it.productId)?.sku}</td>
                    <td className="td">{it.qty} {prod(it.productId)?.unit}</td>
                    <td className="td">{it.pickedQty} {prod(it.productId)?.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold text-gray-900">ไทม์ไลน์สถานะ</h2>
            <ol className="relative space-y-4 border-l border-gray-200 pl-5">
              {order.statusLogs.map((log) => (
                <li key={log.id}>
                  <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-brand-500" />
                  <div className="flex items-center gap-2"><StatusBadge status={log.status} /><span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span></div>
                  <p className="mt-0.5 text-sm text-gray-600">{log.note}{log.userName ? ` — ${log.userName}` : ""}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-1 text-sm">
            <h2 className="mb-2 font-semibold text-gray-900">ผู้รับผิดชอบ</h2>
            <KV label="คนเช็คสินค้า" value={usr(order.pickerId)?.name ?? "-"} />
            <KV label="คนขับ" value={usr(order.driverId)?.name ?? "-"} />
            <KV label="รถ" value={veh(order.vehicleId)?.plate ?? "-"} />
          </div>

          {(isPicker || isAdmin) && order.status === ORDER_STATUS.BILLED && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900">เช็คสินค้า</h3>
              <button onClick={() => store.startChecking(order.id)} className="btn-primary w-full">เริ่มเช็คสินค้า</button>
            </div>
          )}
          {(isPicker || isAdmin) && order.status === ORDER_STATUS.CHECKING && <OpenJobForm orderId={order.id} />}

          {(isDriver || isAdmin) && order.status === ORDER_STATUS.OPEN && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900">งานเปิดรับ</h3>
              <p className="mb-2 text-xs text-gray-500">กดรับงานนี้ (รับได้คนเดียว)</p>
              <button onClick={() => store.claimJob(order.id)} className="btn-primary w-full">🙋 รับงานนี้</button>
            </div>
          )}
          {(isDriver || isAdmin) && order.status === ORDER_STATUS.ACCEPTED && (mine || isAdmin) && (
            <div className="card">
              <h3 className="mb-2 font-semibold text-gray-900">ออกรถ</h3>
              <button onClick={() => store.dispatchOrder(order.id)} className="btn-primary w-full">🚚 เริ่มจัดส่ง (ออกรถ)</button>
            </div>
          )}
          {(isDriver || isAdmin) && order.status === ORDER_STATUS.IN_TRANSIT && (mine || isAdmin) && <DeliverForm orderId={order.id} />}

          {(isIssuer || isAdmin) && open && <CancelForm orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}

function OpenJobForm({ orderId }: { orderId: string }) {
  const store = useStore();
  const order = store.db.orders.find((o) => o.id === orderId)!;
  const [target, setTarget] = useState<"pickup" | "delivery">("pickup");
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [delivery, setDelivery] = useState<LatLng | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [picked, setPicked] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map((i) => [i.id, i.qty])),
  );

  const onPick = (p: LatLng) => (target === "pickup" ? setPickup(p) : setDelivery(p));
  const fmt = (p: LatLng | null) => (p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : "ยังไม่ปักหมุด");
  const dirLink = pickup && delivery
    ? `https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${delivery.lat},${delivery.lng}` : null;

  const submit = () =>
    store.openJob(orderId, {
      picked, pickupAddress,
      pickupLat: pickup?.lat ?? null, pickupLng: pickup?.lng ?? null,
      deliveryLat: delivery?.lat ?? null, deliveryLng: delivery?.lng ?? null,
    });

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-gray-900">เช็คสินค้า & เปิดงาน</h3>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">จำนวนที่เช็คได้</p>
        {order.items.map((it) => {
          const p = store.db.products.find((x) => x.id === it.productId);
          return (
            <div key={it.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{p?.name} <span className="text-gray-400">(สั่ง {it.qty})</span></span>
              <input type="number" min={0} max={it.qty} value={picked[it.id]} onChange={(e) => setPicked((s) => ({ ...s, [it.id]: Number(e.target.value) }))} className="input w-24" />
              <span className="text-xs text-gray-400">{p?.unit}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">กำหนดจุดรับ-ส่ง (คลิกบนแผนที่)</p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setTarget("pickup")} className={`badge ${target === "pickup" ? "bg-green-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>📍 จุดรับ</button>
            <button type="button" onClick={() => setTarget("delivery")} className={`badge ${target === "delivery" ? "bg-red-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>🏁 จุดส่ง</button>
          </div>
        </div>
        <div className="h-72 overflow-hidden rounded-lg border border-gray-200">
          <MapPicker pickup={pickup} delivery={delivery} onPick={onPick} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-green-50 px-2 py-1 text-green-800">จุดรับ: {fmt(pickup)}</div>
          <div className="rounded bg-red-50 px-2 py-1 text-red-800">จุดส่ง: {fmt(delivery)}</div>
        </div>
        {dirLink && <a href={dirLink} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">🗺️ ดูเส้นทางใน Google Maps</a>}
      </div>

      <div>
        <label className="label">ที่อยู่จุดรับ (ต้นทาง)</label>
        <input className="input" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="เช่น คลังสินค้า A" />
        <p className="mt-1 text-xs text-gray-400">ปลายทาง: {order.deliveryAddress}</p>
      </div>

      <button onClick={submit} className="btn-primary w-full">✓ เปิดงาน (ส่งเข้าให้คนขับรับ)</button>
    </div>
  );
}

function DeliverForm({ orderId }: { orderId: string }) {
  const store = useStore();
  const [note, setNote] = useState("");
  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-gray-900">ยืนยันการส่ง</h3>
      <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="หมายเหตุ (เช่น ผู้รับ: คุณ...)" />
      <button onClick={() => store.markDelivered(orderId, note)} className="btn-primary w-full">✓ ส่งสำเร็จ</button>
    </div>
  );
}

function CancelForm({ orderId }: { orderId: string }) {
  const store = useStore();
  const [note, setNote] = useState("");
  return (
    <div className="card space-y-2">
      <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เหตุผลการยกเลิก" />
      <button onClick={() => store.cancelOrder(orderId, note)} className="btn-danger w-full">ยกเลิกบิล</button>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-gray-500">{label}</dt><dd className="font-medium">{value}</dd></div>;
}
