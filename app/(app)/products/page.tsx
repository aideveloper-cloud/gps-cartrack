import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { adjustStock } from "@/app/actions/products";
import { AddProductForm } from "./AddProductForm";

export default async function ProductsPage() {
  await requireRole(ROLES.ADMIN, ROLES.ISSUER);
  const products = await prisma.product.findMany({ orderBy: { sku: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">สินค้า / สต็อก</h1>

      <AddProductForm />

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th">SKU</th>
              <th className="th">ชื่อสินค้า</th>
              <th className="th">หน่วย</th>
              <th className="th">คงเหลือ</th>
              <th className="th">ปรับสต็อก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="td font-medium">{p.sku}</td>
                <td className="td">{p.name}</td>
                <td className="td">{p.unit}</td>
                <td className="td">
                  <span className={p.stockQty <= 0 ? "font-semibold text-red-600" : "font-semibold"}>
                    {p.stockQty}
                  </span>
                </td>
                <td className="td">
                  <form action={adjustStock.bind(null, p.id)} className="flex items-center gap-2">
                    <input
                      name="delta"
                      type="number"
                      defaultValue={10}
                      className="input w-24"
                    />
                    <button className="btn-secondary">บันทึก</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
