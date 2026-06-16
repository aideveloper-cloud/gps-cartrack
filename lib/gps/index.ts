import type { GpsProvider } from "./types";
import { MockGpsProvider } from "./mock";
import { SinoGpsProvider } from "./sino";

let provider: GpsProvider | null = null;

/** Returns the configured GPS provider (mock or sino) as a singleton. */
export function gps(): GpsProvider {
  if (provider) return provider;
  const kind = (process.env.GPS_PROVIDER ?? "mock").toLowerCase();
  provider = kind === "sino" ? new SinoGpsProvider() : new MockGpsProvider();
  return provider;
}

export type { DevicePosition, GpsProvider } from "./types";
