"use client";

import { useActionState, useState } from "react";
import { createOrder } from "@/app/actions/orders";

type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  stockQty: number;
};

type Row = { productId: string; qty: number };

export function NewOrderForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(createOrder, null);
  const [rows, setRows] = useState<Row[]>([{ productId: "", qty: 1 }]);

  const addRow = () => setRows((r) => [...r, { productId: "", qty: 1 }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const itemsJson = JSON.stringify(
    rows.filter((r) => r.productId && r.qty > 0).map((r) => ({ productId: r.productId, qty: Number(r.qty) })),
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={itemsJson} />

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">ข้อมูลลูกค้า / ผู้รับปลายทาง</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">ชื่อลูกค้า *</label>
            <input name="customerName" className="input" required placeholder="เช่น ร้าน ABC" />
          </div>
          <div>
            <label className="label">เบอร์โทร</label>
            <input name="customerPhone" className="input" placeholder="08x-xxx-xxxx" />
          </div>
        </div>
        <div>
          <label className="label">ที่อยู่ปลายทาง *</label>
          <textarea name="deliveryAddress" className="input" rows={2} required placeholder="บ้านเลขที่ ถนน แขวง เขต จังหวัด" />
        </div>
        <div>
          <label className="label">หมายเหตุ</label>
          <input name="note" className="input" placeholder="เช่น ส่งก่อนเที่ยง" />
        </div>
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          จุดรับ-ส่งบนแผนที่จะถูกกำหนดโดยคนจัดสินค้า (Picker) ตอนเช็คสินค้า/เปิดงาน
        </p>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">รายการสินค้า</h2>
          <button type="button" onClick={addRow} className="btn-secondary">
            + เพิ่มรายการ
          </button>
        </div>
        {rows.map((row, i) => {
          const product = products.find((p) => p.id === row.productId);
          return (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="label">สินค้า</label>
                <select
                  className="input"
                  value={row.productId}
                  onChange={(e) => update(i, { productId: e.target.value })}
                >
                  <option value="">— เลือกสินค้า —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (คงเหลือ {p.stockQty} {p.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="label">จำนวน</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={row.qty}
                  onChange={(e) => update(i, { qty: Number(e.target.value) })}
                />
              </div>
              <div className="pb-1 text-xs text-gray-400">{product?.unit ?? ""}</div>
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="btn-secondary mb-0.5">
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <a href="/orders" className="btn-secondary">
          ยกเลิก
        </a>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "กำลังบันทึก..." : "บันทึกใบจ่ายสินค้า"}
        </button>
      </div>
    </form>
  );
}
