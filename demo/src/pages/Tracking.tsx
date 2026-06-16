import { useEffect, useState } from "react";
import { useStore } from "../store";
import { ORDER_STATUS, ROLES } from "../constants";
import MapView, { type MapVehicle } from "../components/MapView";
import { mockPosition } from "../lib";

const POLL_MS = 5000;

export function Tracking() {
  const { db, role, currentUser } = useStore();
  const [tick, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    setUpdatedAt(new Date().toLocaleTimeString("th-TH"));
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setUpdatedAt(new Date().toLocaleTimeString("th-TH"));
    }, POLL_MS);
    return () => clearInterval(t);
  }, []);
  void tick;

  let vehicles = db.vehicles.filter((v) => v.active && v.sinoDeviceId);
  if (role === ROLES.DRIVER) vehicles = vehicles.filter((v) => v.driverId === currentUser.id);

  const mapVehicles: MapVehicle[] = vehicles.map((v) => {
    const pos = mockPosition(v.sinoDeviceId!);
    const activeOrder = db.orders.find((o) => o.vehicleId === v.id && o.status === ORDER_STATUS.IN_TRANSIT);
    return {
      vehicleId: v.id,
      plate: v.plate,
      name: v.name,
      driver: db.users.find((u) => u.id === v.driverId)?.name ?? null,
      speed: pos.speed,
      online: pos.online,
      lat: pos.lat,
      lng: pos.lng,
      activeOrder: activeOrder ? `${activeOrder.code} (${activeOrder.customerName})` : null,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ติดตามรถ</h1>
          <p className="text-sm text-gray-500">
            ที่มา GPS: <span className="font-medium">จำลอง (mock)</span>{updatedAt && ` · อัปเดตล่าสุด ${updatedAt}`}
          </p>
        </div>
        <span className="badge bg-green-100 text-green-800">รีเฟรชอัตโนมัติทุก {POLL_MS / 1000} วินาที</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden p-0 lg:col-span-2" style={{ height: "70vh" }}>
          <MapView vehicles={mapVehicles} />
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold text-gray-900">รถทั้งหมด ({mapVehicles.length})</h2>
          {mapVehicles.map((v) => (
            <div key={v.vehicleId} className="card p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{v.plate}</span>
                <span className={`badge ${v.online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{v.online ? "ออนไลน์" : "ออฟไลน์"}</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">{v.driver ?? "ไม่มีคนขับ"}</div>
              <div className="text-xs text-gray-400">{Math.round(v.speed)} กม./ชม. · {v.lat.toFixed(4)}, {v.lng.toFixed(4)}</div>
              {v.activeOrder && <div className="mt-1 text-xs text-brand-600">กำลังส่ง: {v.activeOrder}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
