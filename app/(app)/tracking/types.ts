import type { DevicePosition } from "@/lib/gps/types";

export type VehiclePosition = {
  vehicleId: string;
  plate: string;
  name: string | null;
  driver: string | null;
  deviceId: string | null;
  position: DevicePosition | null;
  activeOrder: { id: string; code: string; customer: string } | null;
};
