export function formatDateTime(ms: number | null | undefined): string {
  if (!ms) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ms));
}

export function formatDate(ms: number | null | undefined): string {
  if (!ms) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(ms));
}

// Simulated GPS — same loop logic as the real app's mock provider.
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const CENTER = { lat: 13.7563, lng: 100.5018 };

export function mockPosition(deviceId: string) {
  const seed = seedFrom(deviceId);
  const radius = 0.03 + seed * 0.05;
  const period = 120 + seed * 180;
  const phase = seed * Math.PI * 2;
  const t = (Date.now() / 1000 / period) * Math.PI * 2 + phase;
  const lat = CENTER.lat + radius * Math.sin(t) + (seed - 0.5) * 0.04;
  const lng = CENTER.lng + radius * Math.cos(t) + (seed - 0.5) * 0.04;
  const speed = Math.round(20 + Math.abs(Math.sin(t * 1.3)) * 60);
  return { lat, lng, speed, online: true };
}
