"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { VehiclePosition } from "./types";

// Leaflet touches `window` at import time → load the map client-side only.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-400">
      กำลังโหลดแผนที่…
    </div>
  ),
});

const POLL_MS = 5000;

export function TrackingClient() {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/positions", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "โหลดตำแหน่งไม่สำเร็จ");
          return;
        }
        setError(null);
        setVehicles(data.vehicles ?? []);
        setProvider(data.provider ?? "");
        setUpdatedAt(new Date().toLocaleTimeString("th-TH"));
      } catch (e) {
        if (active) setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const withPos = vehicles.filter((v) => v.position);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ติดตามรถ</h1>
          <p className="text-sm text-gray-500">
            ที่มา GPS: <span className="font-medium">{provider === "sino" ? "Sino Tracker" : "จำลอง (mock)"}</span>
            {updatedAt && ` · อัปเดตล่าสุด ${updatedAt}`}
          </p>
        </div>
        <span className="badge bg-green-100 text-green-800">รีเฟรชอัตโนมัติทุก {POLL_MS / 1000} วินาที</span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden p-0 lg:col-span-2" style={{ height: "70vh" }}>
          <MapView vehicles={vehicles} />
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold text-gray-900">รถทั้งหมด ({vehicles.length})</h2>
          {vehicles.length === 0 && (
            <p className="text-sm text-gray-400">
              ยังไม่มีรถที่ผูก Sino Device ID — เพิ่มได้ที่หน้า “รถ &amp; GPS”
            </p>
          )}
          {vehicles.map((v) => (
            <div key={v.vehicleId} className="card p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{v.plate}</span>
                <span
                  className={`badge ${v.position?.online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                >
                  {v.position ? (v.position.online ? "ออนไลน์" : "ออฟไลน์") : "ไม่มีสัญญาณ"}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">{v.driver ?? "ไม่มีคนขับ"}</div>
              {v.position && (
                <div className="text-xs text-gray-400">
                  {Math.round(v.position.speed)} กม./ชม. · {v.position.lat.toFixed(4)}, {v.position.lng.toFixed(4)}
                </div>
              )}
              {v.activeOrder && (
                <a href={`/orders/${v.activeOrder.id}`} className="mt-1 block text-xs text-brand-600 hover:underline">
                  กำลังส่ง: {v.activeOrder.code}
                </a>
              )}
            </div>
          ))}
          <p className="pt-1 text-xs text-gray-400">รถที่มีตำแหน่งบนแผนที่: {withPos.length}</p>
        </div>
      </div>
    </div>
  );
}
