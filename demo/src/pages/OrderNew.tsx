import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";

type Row = { productId: string; qty: number };

export function OrderNew() {
  const { db, createOrder } = useStore();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([{ productId: "", qty: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", deliveryAddress: "", note: "" });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const addRow = () => setRows((r) => [...r, { productId: "", qty: 1 }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = rows.filter((r) => r.productId && r.qty > 0).map((r) => ({ productId: r.productId, qty: Number(r.qty) }));
    if (!form.customerName || !form.deliveryAddress) return setError("กรุณากรอกชื่อลูกค้าและที่อยู่ผู้รับปลายทาง");
    if (items.length === 0) return setError("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
    const id = createOrder({ ...form, items });
    nav(`/orders/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">สร้างใบจ่ายสินค้า</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">ข้อมูลลูกค้า / ผู้รับปลายทาง</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">ชื่อลูกค้า *</label>
              <input className="input" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="เช่น ร้าน ABC" />
            </div>
            <div>
              <label className="label">เบอร์โทร</label>
              <input className="input" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
          </div>
          <div>
            <label className="label">ที่อยู่ปลายทาง *</label>
            <textarea className="input" rows={2} value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} placeholder="บ้านเลขที่ ถนน แขวง เขต จังหวัด" />
          </div>
          <div>
            <label className="label">หมายเหตุ</label>
            <input className="input" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="เช่น ส่งก่อนเที่ยง" />
          </div>
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            จุดรับ-ส่งบนแผนที่จะถูกกำหนดโดยคนจัดสินค้า (Picker) ตอนเช็คสินค้า/เปิดงาน
          </p>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">รายการสินค้า</h2>
            <button type="button" onClick={addRow} className="btn-secondary">+ เพิ่มรายการ</button>
          </div>
          {rows.map((row, i) => {
            const product = db.products.find((p) => p.id === row.productId);
            return (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="label">สินค้า</label>
                  <select className="input" value={row.productId} onChange={(e) => update(i, { productId: e.target.value })}>
                    <option value="">— เลือกสินค้า —</option>
                    {db.products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (คงเหลือ {p.stockQty} {p.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="label">จำนวน</label>
                  <input type="number" min={1} className="input" value={row.qty} onChange={(e) => update(i, { qty: Number(e.target.value) })} />
                </div>
                <div className="pb-1 text-xs text-gray-400">{product?.unit ?? ""}</div>
                {rows.length > 1 && <button type="button" onClick={() => removeRow(i)} className="btn-secondary mb-0.5">✕</button>}
              </div>
            );
          })}
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => nav("/orders")} className="btn-secondary">ยกเลิก</button>
          <button type="submit" className="btn-primary">บันทึกใบจ่ายสินค้า</button>
        </div>
      </form>
    </div>
  );
}
