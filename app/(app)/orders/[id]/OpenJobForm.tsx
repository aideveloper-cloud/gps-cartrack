"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { openJob } from "@/app/actions/orders";
import type { LatLng } from "@/components/MapPicker";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      กำลังโหลดแผนที่…
    </div>
  ),
});

type Item = { id: string; name: string; unit: string; qty: number };

export function OpenJobForm({
  orderId,
  items,
  deliveryAddress,
}: {
  orderId: string;
  items: Item[];
  deliveryAddress: string;
}) {
  const [target, setTarget] = useState<"pickup" | "delivery">("pickup");
  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [delivery, setDelivery] = useState<LatLng | null>(null);

  const onPick = (p: LatLng) => {
    if (target === "pickup") setPickup(p);
    else setDelivery(p);
  };

  const fmt = (p: LatLng | null) => (p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : "ยังไม่ปักหมุด");
  const dirLink =
    pickup && delivery
      ? `https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${delivery.lat},${delivery.lng}`
      : null;

  return (
    <form action={openJob.bind(null, orderId)} className="card space-y-4">
      <h3 className="font-semibold text-gray-900">เช็คสินค้า & เปิดงาน</h3>

      {/* จำนวนที่เช็คได้ */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">จำนวนที่เช็คได้</p>
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <span className="flex-1 text-sm">
              {it.name} <span className="text-gray-400">(สั่ง {it.qty})</span>
            </span>
            <input
              type="number"
              name={`picked_${it.id}`}
              defaultValue={it.qty}
              min={0}
              max={it.qty}
              className="input w-24"
            />
            <span className="text-xs text-gray-400">{it.unit}</span>
          </div>
        ))}
      </div>

      {/* แผนที่กำหนดจุดรับ-ส่ง */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">กำหนดจุดรับ-ส่ง (คลิกบนแผนที่)</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTarget("pickup")}
              className={`badge ${target === "pickup" ? "bg-green-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
            >
              📍 จุดรับ (ต้นทาง)
            </button>
            <button
              type="button"
              onClick={() => setTarget("delivery")}
              className={`badge ${target === "delivery" ? "bg-red-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}
            >
              🏁 จุดส่ง (ปลายทาง)
            </button>
          </div>
        </div>

        <div className="h-72 overflow-hidden rounded-lg border border-gray-200">
          <MapPicker pickup={pickup} delivery={delivery} onPick={onPick} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-green-50 px-2 py-1 text-green-800">
            จุดรับ: {fmt(pickup)}
          </div>
          <div className="rounded bg-red-50 px-2 py-1 text-red-800">
            จุดส่ง: {fmt(delivery)}
          </div>
        </div>
        {dirLink && (
          <a href={dirLink} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
            🗺️ ดูเส้นทางใน Google Maps
          </a>
        )}
      </div>

      <div>
        <label className="label">ที่อยู่จุดรับ (ต้นทาง)</label>
        <input name="pickupAddress" className="input" placeholder="เช่น คลังสินค้า A / สาขาต้นทาง" />
        <p className="mt-1 text-xs text-gray-400">ปลายทาง: {deliveryAddress}</p>
      </div>

      {/* hidden coords */}
      <input type="hidden" name="pickupLat" value={pickup?.lat ?? ""} />
      <input type="hidden" name="pickupLng" value={pickup?.lng ?? ""} />
      <input type="hidden" name="deliveryLat" value={delivery?.lat ?? ""} />
      <input type="hidden" name="deliveryLng" value={delivery?.lng ?? ""} />

      <button className="btn-primary w-full">✓ เปิดงาน (ส่งเข้าให้คนขับรับ)</button>
    </form>
  );
}
