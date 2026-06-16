import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { Role } from "./constants";

const COOKIE_NAME = "session_token";
const SESSION_DAYS = 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Create a session row and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    store.delete(COOKIE_NAME);
  }
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/** Returns the logged-in user or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) {
    return null;
  }
  const { id, name, email, role } = session.user;
  return { id, name, email, role };
}

/** Require any authenticated user; redirect to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require one of the given roles; redirect to / if not allowed. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role as Role)) redirect("/");
  return user;
}
