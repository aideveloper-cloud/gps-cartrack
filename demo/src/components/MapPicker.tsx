import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };
const BANGKOK: [number, number] = [13.7563, 100.5018];

function pin(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 5px rgba(0,0,0,.3);border:2px solid #fff;">
      <span style="transform:rotate(45deg);font-size:11px;font-weight:700;">${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function MapPicker({
  pickup,
  delivery,
  onPick,
}: {
  pickup: LatLng | null;
  delivery: LatLng | null;
  onPick: (p: LatLng) => void;
}) {
  const c = pickup ?? delivery ?? { lat: BANGKOK[0], lng: BANGKOK[1] };
  return (
    <MapContainer center={[c.lat, c.lng]} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onPick={onPick} />
      {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pin("#16a34a", "รับ")} />}
      {delivery && <Marker position={[delivery.lat, delivery.lng]} icon={pin("#dc2626", "ส่ง")} />}
    </MapContainer>
  );
}
