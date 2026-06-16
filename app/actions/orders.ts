"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ORDER_STATUS, ROLES } from "@/lib/constants";
import { generateOrderCode } from "@/lib/format";

async function logStatus(
  orderId: string,
  status: string,
  userId: string,
  note?: string,
) {
  await prisma.statusLog.create({ data: { orderId, status, userId, note } });
}

type NewItem = { productId: string; qty: number };

/** ISSUER/ADMIN วางบิล: ลูกค้า/ผู้รับปลายทาง + รายการสินค้า. */
export async function createOrder(_prev: unknown, formData: FormData) {
  const user = await requireRole(ROLES.ISSUER, ROLES.ADMIN);

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  let items: NewItem[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }
  items = items.filter((i) => i.productId && i.qty > 0);

  if (!customerName || !deliveryAddress) {
    return { error: "กรุณากรอกชื่อลูกค้าและที่อยู่ผู้รับปลายทาง" };
  }
  if (items.length === 0) {
    return { error: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" };
  }

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerName,
      customerPhone: customerPhone || null,
      deliveryAddress,
      note: note || null,
      status: ORDER_STATUS.BILLED,
      issuerId: user.id,
      items: { create: items.map((i) => ({ productId: i.productId, qty: i.qty })) },
      statusLogs: {
        create: [{ status: ORDER_STATUS.BILLED, userId: user.id, note: "วางบิล/จ่ายสินค้า" }],
      },
    },
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

/** PICKER เริ่มเช็คสินค้า (ล็อกว่าใครเป็นคนเช็ค). */
export async function startChecking(orderId: string) {
  const user = await requireRole(ROLES.PICKER, ROLES.ADMIN);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CHECKING, pickerId: user.id },
  });
  await logStatus(orderId, ORDER_STATUS.CHECKING, user.id, "เริ่มเช็คสินค้า");
  revalidatePath(`/orders/${orderId}`);
}

/**
 * PICKER เปิดงาน: บันทึกจำนวนที่เช็คได้ (ตัดสต็อก) + กำหนดจุดรับ/จุดส่ง
 * (ปักหมุดบนแผนที่) แล้วเผยแพร่งานเข้า pool ให้คนขับรับ.
 */
export async function openJob(orderId: string, formData: FormData) {
  const user = await requireRole(ROLES.PICKER, ROLES.ADMIN);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const pickupAddress = String(formData.get("pickupAddress") ?? "").trim();
  const pickupLat = toNum(formData.get("pickupLat"));
  const pickupLng = toNum(formData.get("pickupLng"));
  const deliveryLat = toNum(formData.get("deliveryLat"));
  const deliveryLng = toNum(formData.get("deliveryLng"));

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const checked = Number(formData.get(`picked_${item.id}`) ?? 0);
      const safe = Math.max(0, Math.min(checked, item.qty));
      await tx.orderItem.update({ where: { id: item.id }, data: { pickedQty: safe } });
      if (safe > 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: safe } },
        });
      }
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.OPEN,
        pickerId: user.id,
        openedAt: new Date(),
        pickupAddress: pickupAddress || null,
        pickupLat,
        pickupLng,
        deliveryLat,
        deliveryLng,
      },
    });
  });

  await logStatus(orderId, ORDER_STATUS.OPEN, user.id, "เปิดงาน รอคนขับรับ");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/jobs");
  revalidatePath("/products");
}

/**
 * DRIVER กดรับงานจาก pool — ล็อกแบบ atomic ให้รับได้คนเดียว.
 * ใช้รถที่ผูกกับคนขับคนนั้นไว้สำหรับติดตาม GPS.
 */
export async function claimJob(orderId: string) {
  const user = await requireRole(ROLES.DRIVER, ROLES.ADMIN);

  const vehicle = await prisma.vehicle.findUnique({ where: { driverId: user.id } });

  // updateMany + เงื่อนไข driverId:null กันการแย่งรับซ้ำ (race condition).
  const res = await prisma.order.updateMany({
    where: { id: orderId, status: ORDER_STATUS.OPEN, driverId: null },
    data: {
      status: ORDER_STATUS.ACCEPTED,
      driverId: user.id,
      vehicleId: vehicle?.id ?? null,
      acceptedAt: new Date(),
    },
  });

  // res.count === 0 = งานถูกคนอื่นรับไปแล้ว → แค่ refresh ให้งานหายจาก pool
  if (res.count > 0) {
    await logStatus(orderId, ORDER_STATUS.ACCEPTED, user.id, "คนขับรับงาน");
  }
  revalidatePath("/jobs");
  revalidatePath(`/orders/${orderId}`);
}

/** DRIVER ออกรถเริ่มจัดส่ง. */
export async function dispatchOrder(orderId: string) {
  const user = await requireRole(ROLES.DRIVER, ROLES.ADMIN);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.IN_TRANSIT, dispatchedAt: new Date() },
  });
  await logStatus(orderId, ORDER_STATUS.IN_TRANSIT, user.id, "ออกรถจัดส่ง");
  revalidatePath(`/orders/${orderId}`);
}

/** DRIVER ยืนยันส่งสำเร็จ. */
export async function markDelivered(orderId: string, formData: FormData) {
  const user = await requireRole(ROLES.DRIVER, ROLES.ADMIN);
  const note = String(formData.get("note") ?? "").trim();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.DELIVERED, deliveredAt: new Date() },
  });
  await logStatus(orderId, ORDER_STATUS.DELIVERED, user.id, note || "ส่งสำเร็จ");
  revalidatePath(`/orders/${orderId}`);
}

/** ISSUER/ADMIN ยกเลิกบิล. */
export async function cancelOrder(orderId: string, formData: FormData) {
  const user = await requireRole(ROLES.ADMIN, ROLES.ISSUER);
  const note = String(formData.get("note") ?? "").trim();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CANCELLED },
  });
  await logStatus(orderId, ORDER_STATUS.CANCELLED, user.id, note || "ยกเลิกบิล");
  revalidatePath(`/orders/${orderId}`);
}

function toNum(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
