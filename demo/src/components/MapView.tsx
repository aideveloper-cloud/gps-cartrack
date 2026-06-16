import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BANGKOK: [number, number] = [13.7563, 100.5018];

export type MapVehicle = {
  vehicleId: string;
  plate: string;
  name: string | null;
  driver: string | null;
  speed: number;
  online: boolean;
  lat: number;
  lng: number;
  activeOrder: string | null;
};

function truckIcon(online: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${online ? "#2563eb" : "#9ca3af"};color:#fff;width:34px;height:34px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;">
      <span style="transform:rotate(45deg);font-size:16px;">🚚</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

export default function MapView({ vehicles }: { vehicles: MapVehicle[] }) {
  return (
    <MapContainer center={BANGKOK} zoom={11} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {vehicles.map((v) => (
        <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={truckIcon(v.online)}>
          <Popup>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{v.plate}{v.name ? ` · ${v.name}` : ""}</div>
              <div>คนขับ: {v.driver ?? "-"}</div>
              <div>ความเร็ว: {Math.round(v.speed)} กม./ชม.</div>
              {v.activeOrder && <div style={{ color: "#1d4ed8" }}>กำลังส่ง: {v.activeOrder}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
