"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/app/actions/users";
import { ROLE_LABELS } from "@/lib/constants";

export function AddUserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="card grid items-end gap-3 sm:grid-cols-5">
      <div>
        <label className="label">ชื่อ *</label>
        <input name="name" className="input" required />
      </div>
      <div>
        <label className="label">อีเมล *</label>
        <input name="email" type="email" className="input" required />
      </div>
      <div>
        <label className="label">บทบาท *</label>
        <select name="role" className="input" defaultValue="DRIVER">
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">รหัสผ่าน *</label>
        <input name="password" type="text" className="input" required placeholder="ตั้งรหัสผ่าน" />
      </div>
      <div>
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "..." : "+ เพิ่มผู้ใช้"}
        </button>
      </div>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-5">{state.error}</p>
      )}
    </form>
  );
}
