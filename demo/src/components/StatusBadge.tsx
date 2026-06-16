import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
  const label = STATUS_LABELS[status] ?? status;
  return <span className={`badge ${color}`}>{label}</span>;
}
