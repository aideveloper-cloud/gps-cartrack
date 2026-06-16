"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="input"
          placeholder="you@demo.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
