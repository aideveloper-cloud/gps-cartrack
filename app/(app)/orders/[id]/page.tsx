import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ORDER_STATUS, ROLES } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import {
  cancelOrder,
  claimJob,
  dispatchOrder,
  markDelivered,
  startChecking,
} from "@/app/actions/orders";
import { OpenJobForm } from "./OpenJobForm";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      issuer: true,
      picker: true,
      driver: true,
      vehicle: true,
      statusLogs: { orderBy: { createdAt: "asc" }, include: { user: true } },
    },
  });
  if (!order) notFound();

  const isAdmin = user.role === ROLES.ADMIN;
  const isIssuer = user.role === ROLES.ISSUER;
  const isPicker = user.role === ROLES.PICKER;
  const isDriver = user.role === ROLES.DRIVER;
  const open = order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED;
  const mineAsDriver = order.driverId === user.id;

  const dirLink =
    order.pickupLat != null && order.deliveryLat != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${order.pickupLat},${order.pickupLng}&destination=${order.deliveryLat},${order.deliveryLng}`
      : null;

  return (
    <div className="space-y-6">
      <Link href="/orders" className="text-sm text-brand-600 hover:underline">
        ← ใบจ่ายสินค้า
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.code}</h1>
          <p className="text-sm text-gray-500">
            วางบิล {formatDateTime(order.createdAt)} โดย {order.issuer.name}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h2 className="mb-3 font-semibold text-gray-900">ข้อมูลลูกค้า / ปลายทาง</h2>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Field label="ลูกค้า" value={order.customerName} />
              <Field label="เบอร์โทร" value={order.customerPhone ?? "-"} />
              <div className="sm:col-span-2">
                <dt className="text-gray-500">ที่อยู่ปลายทาง</dt>
                <dd className="font-medium">{order.deliveryAddress}</dd>
              </div>
              {order.note && (
                <div className="sm:col-span-2">
                  <Field label="หมายเหตุ" value={order.note} />
                </div>
              )}
            </dl>
          </div>

          {/* จุดรับ-ส่ง (หลัง Picker กำหนด) */}
          {(order.pickupLat != null || order.deliveryLat != null || order.pickupAddress) && (
            <div className="card">
              <h2 className="mb-3 font-semibold text-gray-900">จุดรับ-ส่ง</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="font-medium text-green-800">📍 จุดรับ (ต้นทาง)</div>
                  <div>{order.pickupAddress ?? "-"}</div>
                  {order.pickupLat != null && (
                    <div className="text-xs text-gray-500">{order.pickupLat.toFixed(5)}, {order.pickupLng?.toFixed(5)}</div>
                  )}
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="font-medium text-red-800">🏁 จุดส่ง (ปลายทาง)</div>
                  <div>{order.deliveryAddress}</div>
                  {order.deliveryLat != null && (
                    <div className="text-xs text-gray-500">{order.deliveryLat.toFixed(5)}, {order.deliveryLng?.toFixed(5)}</div>
                  )}
                </div>
              </div>
              {dirLink && (
                <a href={dirLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                  🗺️ เปิดเส้นทางใน Google Maps
                </a>
              )}
            </div>
          )}

          <div className="card p-0">
            <h2 className="border-b border-gray-100 px-5 py-3 font-semibold text-gray-900">รายการสินค้า</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">สินค้า</th>
                  <th className="th">SKU</th>
                  <th className="th">สั่ง</th>
                  <th className="th">เช็คได้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td className="td">{it.product.name}</td>
                    <td className="td text-gray-400">{it.product.sku}</td>
                    <td className="td">{it.qty} {it.product.unit}</td>
                    <td className="td">{it.pickedQty} {it.product.unit}</td>
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
                  <div className="flex items-center gap-2">
                    <StatusBadge status={log.status} />
                    <span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {log.note}
                    {log.user ? ` — ${log.user.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="card space-y-1 text-sm">
            <h2 className="mb-2 font-semibold text-gray-900">ผู้รับผิดชอบ</h2>
            <RowKV label="คนเช็คสินค้า" value={order.picker?.name} />
            <RowKV label="คนขับ" value={order.driver?.name} />
            <RowKV label="รถ" value={order.vehicle ? order.vehicle.plate : undefined} />
          </div>

          {/* PICKER */}
          {(isPicker || isAdmin) && order.status === ORDER_STATUS.BILLED && (
            <form action={startChecking.bind(null, order.id)} className="card">
              <h3 className="mb-2 font-semibold text-gray-900">เช็คสินค้า</h3>
              <button className="btn-primary w-full">เริ่มเช็คสินค้า</button>
            </form>
          )}
          {(isPicker || isAdmin) && order.status === ORDER_STATUS.CHECKING && (
            <OpenJobForm
              orderId={order.id}
              deliveryAddress={order.deliveryAddress}
              items={order.items.map((it) => ({
                id: it.id,
                name: it.product.name,
                unit: it.product.unit,
                qty: it.qty,
              }))}
            />
          )}

          {/* DRIVER */}
          {(isDriver || isAdmin) && order.status === ORDER_STATUS.OPEN && (
            <form action={claimJob.bind(null, order.id)} className="card">
              <h3 className="mb-2 font-semibold text-gray-900">งานเปิดรับ</h3>
              <p className="mb-2 text-xs text-gray-500">กดรับงานนี้ (รับได้คนเดียว)</p>
              <button className="btn-primary w-full">🙋 รับงานนี้</button>
            </form>
          )}
          {(isDriver || isAdmin) && order.status === ORDER_STATUS.ACCEPTED && (mineAsDriver || isAdmin) && (
            <form action={dispatchOrder.bind(null, order.id)} className="card">
              <h3 className="mb-2 font-semibold text-gray-900">ออกรถ</h3>
              <button className="btn-primary w-full">🚚 เริ่มจัดส่ง (ออกรถ)</button>
            </form>
          )}
          {(isDriver || isAdmin) && order.status === ORDER_STATUS.IN_TRANSIT && (mineAsDriver || isAdmin) && (
            <form action={markDelivered.bind(null, order.id)} className="card space-y-3">
              <h3 className="font-semibold text-gray-900">ยืนยันการส่ง</h3>
              <input name="note" className="input" placeholder="หมายเหตุ (เช่น ผู้รับ: คุณ...)" />
              <button className="btn-primary w-full">✓ ส่งสำเร็จ</button>
            </form>
          )}

          {/* CANCEL */}
          {(isIssuer || isAdmin) && open && (
            <form action={cancelOrder.bind(null, order.id)} className="card space-y-2">
              <input name="note" className="input" placeholder="เหตุผลการยกเลิก" />
              <button className="btn-danger w-full">ยกเลิกบิล</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function RowKV({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value ?? "-"}</span>
    </div>
  );
}
