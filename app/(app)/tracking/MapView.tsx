"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { VehiclePosition } from "./types";

const BANGKOK: [number, number] = [13.7563, 100.5018];

function truckIcon(online: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${online ? "#2563eb" : "#9ca3af"};
      color:#fff;width:34px;height:34px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;">
      <span style="transform:rotate(45deg);font-size:16px;">🚚</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

// Pan/zoom to fit all vehicles whenever the set of positions changes.
function FitBounds({ vehicles }: { vehicles: VehiclePosition[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = vehicles
      .filter((v) => v.position)
      .map((v) => [v.position!.lat, v.position!.lng]) as [number, number][];
    if (pts.length === 1) map.setView(pts[0], 13);
    else if (pts.length > 1) map.fitBounds(pts, { padding: [50, 50] });
  }, [vehicles, map]);
  return null;
}

export default function MapView({ vehicles }: { vehicles: VehiclePosition[] }) {
  return (
    <MapContainer
      center={BANGKOK}
      zoom={11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds vehicles={vehicles} />
      {vehicles.map((v) =>
        v.position ? (
          <Marker
            key={v.vehicleId}
            position={[v.position.lat, v.position.lng]}
            icon={truckIcon(v.position.online)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{v.plate}{v.name ? ` · ${v.name}` : ""}</div>
                <div>คนขับ: {v.driver ?? "-"}</div>
                <div>ความเร็ว: {Math.round(v.position.speed)} กม./ชม.</div>
                {v.activeOrder && (
                  <div className="mt-1 text-brand-700">
                    กำลังส่ง: {v.activeOrder.code} ({v.activeOrder.customer})
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  );
}
