"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, requireRole } from "@/lib/auth";
import { ROLE_LABELS, ROLES } from "@/lib/constants";

export async function createUser(_prev: unknown, formData: FormData) {
  await requireRole(ROLES.ADMIN);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "กรุณากรอกชื่อ อีเมล และรหัสผ่าน" };
  }
  if (!Object.keys(ROLE_LABELS).includes(role)) {
    return { error: "บทบาทไม่ถูกต้อง" };
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "อีเมลนี้ถูกใช้แล้ว" };

  await prisma.user.create({
    data: { name, email, role, passwordHash: await hashPassword(password) },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function toggleUserActive(userId: string) {
  await requireRole(ROLES.ADMIN);
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return;
  await prisma.user.update({ where: { id: userId }, data: { active: !u.active } });
  revalidatePath("/admin/users");
}
