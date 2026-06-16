import type { DevicePosition, GpsProvider } from "./types";

// Deterministic pseudo-random from a string seed.
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// Simulates vehicles driving in slow loops around Bangkok so the tracking
// map shows live-looking movement without any external service.
const CENTER = { lat: 13.7563, lng: 100.5018 };

export class MockGpsProvider implements GpsProvider {
  async getPosition(deviceId: string): Promise<DevicePosition | null> {
    const seed = seedFrom(deviceId);
    const radius = 0.03 + seed * 0.05; // ~3-9 km loop
    const period = 120 + seed * 180; // seconds per loop
    const phase = seed * Math.PI * 2;
    const t = (Date.now() / 1000 / period) * Math.PI * 2 + phase;

    const lat = CENTER.lat + radius * Math.sin(t) + (seed - 0.5) * 0.04;
    const lng = CENTER.lng + radius * Math.cos(t) + (seed - 0.5) * 0.04;
    const speed = Math.round(20 + Math.abs(Math.sin(t * 1.3)) * 60);
    const course = ((Math.atan2(Math.cos(t), -Math.sin(t)) * 180) / Math.PI + 360) % 360;

    return {
      deviceId,
      lat,
      lng,
      speed,
      course,
      online: true,
      recordedAt: new Date().toISOString(),
    };
  }

  async getPositions(deviceIds: string[]): Promise<DevicePosition[]> {
    const out: DevicePosition[] = [];
    for (const id of deviceIds) {
      const p = await this.getPosition(id);
      if (p) out.push(p);
    }
    return out;
  }
}
