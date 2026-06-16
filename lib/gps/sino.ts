import type { DevicePosition, GpsProvider } from "./types";

/**
 * Sino Tracker integration.
 *
 * Sino / SinoTrack devices are typically read through a GPS platform that
 * exposes an HTTP API (the exact shape varies by platform — sinotrack.com,
 * a self-hosted gps-server/traccar instance, etc.). This adapter centralizes
 * that call so the rest of the app only depends on the GpsProvider interface.
 *
 * TODO(integration): replace the body of `fetchRaw` with the real request for
 * your platform and map the response in `mapPosition`. Configure credentials
 * in .env (SINO_API_BASE, SINO_API_TOKEN, SINO_ACCOUNT, SINO_PASSWORD).
 */
export class SinoGpsProvider implements GpsProvider {
  private base = process.env.SINO_API_BASE ?? "";
  private token = process.env.SINO_API_TOKEN ?? "";

  private async fetchRaw(deviceIds: string[]): Promise<unknown> {
    if (!this.base) {
      throw new Error(
        "SINO_API_BASE is not set. Configure Sino Tracker credentials in .env, " +
          'or set GPS_PROVIDER="mock" for development.',
      );
    }

    // ── Example shape — adjust to your platform's real endpoint/params ──
    // Many SinoTrack-compatible platforms accept device IMEIs and return the
    // last known location. Replace the URL/params/headers below accordingly.
    const url = new URL("/api/devices/last", this.base);
    url.searchParams.set("imeis", deviceIds.join(","));

    const res = await fetch(url.toString(), {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      // Always hit the live platform; never cache positions.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Sino API error ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  // Map one raw platform record to our DevicePosition shape.
  private mapPosition(raw: any): DevicePosition | null {
    if (!raw) return null;
    const lat = Number(raw.lat ?? raw.latitude);
    const lng = Number(raw.lng ?? raw.lon ?? raw.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return {
      deviceId: String(raw.imei ?? raw.deviceId ?? raw.id),
      lat,
      lng,
      speed: Number(raw.speed ?? 0),
      course: raw.course != null ? Number(raw.course) : undefined,
      online: raw.online ?? true,
      recordedAt: raw.time ?? raw.recordedAt ?? new Date().toISOString(),
    };
  }

  async getPositions(deviceIds: string[]): Promise<DevicePosition[]> {
    if (deviceIds.length === 0) return [];
    const raw = (await this.fetchRaw(deviceIds)) as any;
    const list: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.devices ?? []);
    return list
      .map((r) => this.mapPosition(r))
      .filter((p): p is DevicePosition => p !== null);
  }

  async getPosition(deviceId: string): Promise<DevicePosition | null> {
    const [p] = await this.getPositions([deviceId]);
    return p ?? null;
  }
}
