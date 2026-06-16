import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("password123", 10);

  const [admin, issuer, picker, driver1, driver2] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@demo.com" },
      update: {},
      create: { name: "ผู้ดูแลระบบ", email: "admin@demo.com", passwordHash: pw, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "issuer@demo.com" },
      update: {},
      create: { name: "สมชาย (จ่ายสินค้า)", email: "issuer@demo.com", passwordHash: pw, role: "ISSUER" },
    }),
    prisma.user.upsert({
      where: { email: "picker@demo.com" },
      update: {},
      create: { name: "สมหญิง (จัดสินค้า)", email: "picker@demo.com", passwordHash: pw, role: "PICKER" },
    }),
    prisma.user.upsert({
      where: { email: "driver1@demo.com" },
      update: {},
      create: { name: "สมศักดิ์ (คนขับ)", email: "driver1@demo.com", passwordHash: pw, role: "DRIVER" },
    }),
    prisma.user.upsert({
      where: { email: "driver2@demo.com" },
      update: {},
      create: { name: "สมพร (คนขับ)", email: "driver2@demo.com", passwordHash: pw, role: "DRIVER" },
    }),
  ]);

  const products = await Promise.all(
    [
      { sku: "SKU-001", name: "น้ำดื่ม 600ml (แพ็ค 12)", unit: "แพ็ค", stockQty: 500 },
      { sku: "SKU-002", name: "ข้าวสารหอมมะลิ 5kg", unit: "ถุง", stockQty: 200 },
      { sku: "SKU-003", name: "น้ำมันพืช 1L", unit: "ขวด", stockQty: 300 },
      { sku: "SKU-004", name: "กระดาษ A4 (รีม)", unit: "รีม", stockQty: 150 },
    ].map((p) =>
      prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p }),
    ),
  );

  const [veh1, veh2] = await Promise.all([
    prisma.vehicle.upsert({
      where: { plate: "1กก-1234" },
      update: { driverId: driver1.id },
      create: { plate: "1กก-1234", name: "กระบะ Isuzu", sinoDeviceId: "SINO-100001", driverId: driver1.id },
    }),
    prisma.vehicle.upsert({
      where: { plate: "2ขข-5678" },
      update: { driverId: driver2.id },
      create: { plate: "2ขข-5678", name: "6 ล้อ Hino", sinoDeviceId: "SINO-100002", driverId: driver2.id },
    }),
  ]);

  // Sample order in CREATED state
  const existing = await prisma.order.findFirst({ where: { code: "DO-DEMO-0001" } });
  if (!existing) {
    await prisma.order.create({
      data: {
        code: "DO-DEMO-0001",
        customerName: "ร้านสะดวกซื้อ ABC",
        customerPhone: "0812345678",
        deliveryAddress: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        status: "BILLED",
        issuerId: issuer.id,
        items: {
          create: [
            { productId: products[0].id, qty: 10 },
            { productId: products[1].id, qty: 5 },
          ],
        },
        statusLogs: { create: [{ status: "BILLED", userId: issuer.id, note: "วางบิล/จ่ายสินค้า" }] },
      },
    });
  }

  console.log("Seed done.");
  console.log("Logins (password: password123):");
  console.log("  admin@demo.com / issuer@demo.com / picker@demo.com / driver1@demo.com / driver2@demo.com");
  console.log(`Vehicles: ${veh1.plate}, ${veh2.plate}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
