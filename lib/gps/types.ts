export type DevicePosition = {
  deviceId: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  course?: number; // heading 0-360
  online: boolean;
  recordedAt: string; // ISO timestamp
};

export interface GpsProvider {
  /** Fetch the latest position for a single device, or null if unknown. */
  getPosition(deviceId: string): Promise<DevicePosition | null>;
  /** Fetch latest positions for many devices at once. */
  getPositions(deviceIds: string[]): Promise<DevicePosition[]>;
}
