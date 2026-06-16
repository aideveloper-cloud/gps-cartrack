import { useState } from "react";
import { useStore } from "../store";

export function Products() {
  const { db, addProduct, adjustStock } = useStore();
  const [form, setForm] = useState({ sku: "", name: "", unit: "ชิ้น", stockQty: 0 });
  const [deltas, setDeltas] = useState<Record<string, number>>({});

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name) return;
    addProduct({ ...form, stockQty: Number(form.stockQty) });
    setForm({ sku: "", name: "", unit: "ชิ้น", stockQty: 0 });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">สินค้า / สต็อก</h1>

      <form onSubmit={add} className="card grid items-end gap-3 sm:grid-cols-5">
        <div><label className="label">SKU *</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-005" /></div>
        <div className="sm:col-span-2"><label className="label">ชื่อสินค้า *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">หน่วย</label><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div><label className="label">สต็อกเริ่มต้น</label><input type="number" className="input" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })} /></div>
        <div className="sm:col-span-5"><button className="btn-primary">+ เพิ่มสินค้า</button></div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="th">SKU</th><th className="th">ชื่อสินค้า</th><th className="th">หน่วย</th><th className="th">คงเหลือ</th><th className="th">ปรับสต็อก</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {db.products.map((p) => (
              <tr key={p.id}>
                <td className="td font-medium">{p.sku}</td>
                <td className="td">{p.name}</td>
                <td className="td">{p.unit}</td>
                <td className="td"><span className={p.stockQty <= 0 ? "font-semibold text-red-600" : "font-semibold"}>{p.stockQty}</span></td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-24" value={deltas[p.id] ?? 10} onChange={(e) => setDeltas((s) => ({ ...s, [p.id]: Number(e.target.value) }))} />
                    <button className="btn-secondary" onClick={() => adjustStock(p.id, deltas[p.id] ?? 10)}>บันทึก</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
