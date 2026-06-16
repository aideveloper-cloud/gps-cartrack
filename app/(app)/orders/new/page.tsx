import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { NewOrderForm } from "./NewOrderForm";

export default async function NewOrderPage() {
  await requireRole(ROLES.ISSUER, ROLES.ADMIN);
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, sku: true, name: true, unit: true, stockQty: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">สร้างใบจ่ายสินค้า</h1>
      <NewOrderForm products={products} />
    </div>
  );
}
