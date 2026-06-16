"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function createProduct(_prev: unknown, formData: FormData) {
  await requireRole(ROLES.ADMIN, ROLES.ISSUER);
  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "ชิ้น").trim() || "ชิ้น";
  const stockQty = Number(formData.get("stockQty") ?? 0);

  if (!sku || !name) return { error: "กรุณากรอก SKU และชื่อสินค้า" };

  const exists = await prisma.product.findUnique({ where: { sku } });
  if (exists) return { error: "SKU นี้มีอยู่แล้ว" };

  await prisma.product.create({
    data: { sku, name, unit, stockQty: Number.isFinite(stockQty) ? stockQty : 0 },
  });
  revalidatePath("/products");
  return { ok: true };
}

export async function adjustStock(productId: string, formData: FormData) {
  await requireRole(ROLES.ADMIN, ROLES.ISSUER);
  const delta = Number(formData.get("delta") ?? 0);
  if (!Number.isFinite(delta) || delta === 0) return;
  await prisma.product.update({
    where: { id: productId },
    data: { stockQty: { increment: delta } },
  });
  revalidatePath("/products");
}
