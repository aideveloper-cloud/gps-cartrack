"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function createVehicle(_prev: unknown, formData: FormData) {
  await requireRole(ROLES.ADMIN);
  const plate = String(formData.get("plate") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const sinoDeviceId = String(formData.get("sinoDeviceId") ?? "").trim();
  const driverId = String(formData.get("driverId") ?? "").trim();

  if (!plate) return { error: "กรุณากรอกทะเบียนรถ" };
  const exists = await prisma.vehicle.findUnique({ where: { plate } });
  if (exists) return { error: "ทะเบียนรถนี้มีอยู่แล้ว" };

  await prisma.vehicle.create({
    data: {
      plate,
      name: name || null,
      sinoDeviceId: sinoDeviceId || null,
      driverId: driverId || null,
    },
  });
  revalidatePath("/vehicles");
  return { ok: true };
}

export async function updateVehicle(vehicleId: string, formData: FormData) {
  await requireRole(ROLES.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const sinoDeviceId = String(formData.get("sinoDeviceId") ?? "").trim();
  const driverId = String(formData.get("driverId") ?? "").trim();

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      name: name || null,
      sinoDeviceId: sinoDeviceId || null,
      driverId: driverId || null,
    },
  });
  revalidatePath("/vehicles");
}
