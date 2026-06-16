"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct } from "@/app/actions/products";

export function AddProductForm() {
  const [state, formAction, pending] = useActionState(createProduct, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="card grid items-end gap-3 sm:grid-cols-5">
      <div>
        <label className="label">SKU *</label>
        <input name="sku" className="input" required placeholder="SKU-005" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">ชื่อสินค้า *</label>
        <input name="name" className="input" required placeholder="ชื่อสินค้า" />
      </div>
      <div>
        <label className="label">หน่วย</label>
        <input name="unit" className="input" defaultValue="ชิ้น" />
      </div>
      <div>
        <label className="label">สต็อกเริ่มต้น</label>
        <input name="stockQty" type="number" className="input" defaultValue={0} />
      </div>
      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-5">{state.error}</p>
      )}
      <div className="sm:col-span-5">
        <button className="btn-primary" disabled={pending}>
          {pending ? "กำลังเพิ่ม..." : "+ เพิ่มสินค้า"}
        </button>
      </div>
    </form>
  );
}
