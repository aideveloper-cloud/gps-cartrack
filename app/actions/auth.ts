"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  verifyPassword,
} from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
