import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gps } from "@/lib/gps";
import { ORDER_STATUS, ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Returns the latest GPS position for every vehicle that has a Sino device id,
// enriched with vehicle/driver/current-delivery info for the tracking map.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Drivers only see their own vehicle.
  const where: Record<string, unknown> = {
    active: true,
    sinoDeviceId: { not: null },
  };
  if (user.role === ROLES.DRIVER) where.driverId = user.id;

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      driver: true,
      orders: {
        where: { status: ORDER_STATUS.IN_TRANSIT },
        orderBy: { dispatchedAt: "desc" },
        take: 1,
      },
    },
  });

  const deviceIds = vehicles.map((v) => v.sinoDeviceId!).filter(Boolean);

  let positions;
  try {
    positions = await gps().getPositions(deviceIds);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "gps error" },
      { status: 502 },
    );
  }

  const posByDevice = new Map(positions.map((p) => [p.deviceId, p]));

  const result = vehicles.map((v) => {
    const pos = posByDevice.get(v.sinoDeviceId!);
    const activeOrder = v.orders[0];
    return {
      vehicleId: v.id,
      plate: v.plate,
      name: v.name,
      driver: v.driver?.name ?? null,
      deviceId: v.sinoDeviceId,
      position: pos ?? null,
      activeOrder: activeOrder
        ? { id: activeOrder.id, code: activeOrder.code, customer: activeOrder.customerName }
        : null,
    };
  });

  return NextResponse.json({ provider: process.env.GPS_PROVIDER ?? "mock", vehicles: result });
}
