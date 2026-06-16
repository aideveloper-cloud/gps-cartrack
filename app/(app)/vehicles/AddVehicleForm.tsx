"use client";

import { useActionState, useEffect, useRef } from "react";
import { createVehicle } from "@/app/actions/vehicles";

type Driver = { id: string; name: string };

export function AddVehicleForm({ drivers }: { drivers: Driver[] }) {
  const [state, formAction, pending] = useActionState(createVehicle, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="card grid items-end gap-3 sm:grid-cols-5">
      <div>
        <label className="label">ทะเบียน *</label>
        <input name="plate" className="input" required placeholder="1กก-1234" />
      </div>
      <div>
        <label className="label">ชื่อ/รุ่น</label>
        <input name="name" className="input" placeholder="กระบะ Isuzu" />
      </div>
      <div>
        <label className="label">Sino Device ID</label>
        <input name="sinoDeviceId" className="input" placeholder="IMEI" />
      </div>
      <div>
        <label className="label">คนขับ</label>
        <select name="driverId" className="input" defaultValue="">
          <option value="">— ไม่ระบุ —</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "..." : "+ เพิ่มรถ"}
        </button>
      </div>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-5">{state.error}</p>
      )}
    </form>
  );
}
