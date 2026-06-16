import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ORDER_STATUS, ROLES, type Role } from "./constants";

export type User = { id: string; name: string; email: string; role: string; active: boolean };
export type Product = { id: string; sku: string; name: string; unit: string; stockQty: number };
export type Vehicle = {
  id: string;
  plate: string;
  name: string | null;
  sinoDeviceId: string | null;
  driverId: string | null;
  active: boolean;
};
export type OrderItem = { id: string; productId: string; qty: number; pickedQty: number };
export type StatusLog = { id: string; status: string; note?: string; userName?: string; createdAt: number };
export type Order = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string | null;
  note: string | null;
  status: string;
  pickupAddress: string | null;
  pickupLat: number | null;
  pickupLng: number | null;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  createdAt: number;
  openedAt: number | null;
  acceptedAt: number | null;
  dispatchedAt: number | null;
  deliveredAt: number | null;
  issuerId: string;
  pickerId: string | null;
  driverId: string | null;
  vehicleId: string | null;
  items: OrderItem[];
  statusLogs: StatusLog[];
};

let seq = 0;
const id = (p = "id") => `${p}-${(++seq).toString(36)}`;

function seed() {
  const users: User[] = [
    { id: "u-admin", name: "ผู้ดูแลระบบ", email: "admin@demo.com", role: ROLES.ADMIN, active: true },
    { id: "u-issuer", name: "สมชาย (จ่ายสินค้า)", email: "issuer@demo.com", role: ROLES.ISSUER, active: true },
    { id: "u-picker", name: "สมหญิง (จัดสินค้า)", email: "picker@demo.com", role: ROLES.PICKER, active: true },
    { id: "u-d1", name: "สมศักดิ์ (คนขับ)", email: "driver1@demo.com", role: ROLES.DRIVER, active: true },
    { id: "u-d2", name: "สมพร (คนขับ)", email: "driver2@demo.com", role: ROLES.DRIVER, active: true },
  ];
  const products: Product[] = [
    { id: "p1", sku: "SKU-001", name: "น้ำดื่ม 600ml (แพ็ค 12)", unit: "แพ็ค", stockQty: 500 },
    { id: "p2", sku: "SKU-002", name: "ข้าวสารหอมมะลิ 5kg", unit: "ถุง", stockQty: 200 },
    { id: "p3", sku: "SKU-003", name: "น้ำมันพืช 1L", unit: "ขวด", stockQty: 300 },
    { id: "p4", sku: "SKU-004", name: "กระดาษ A4 (รีม)", unit: "รีม", stockQty: 150 },
  ];
  const vehicles: Vehicle[] = [
    { id: "v1", plate: "1กก-1234", name: "กระบะ Isuzu", sinoDeviceId: "SINO-100001", driverId: "u-d1", active: true },
    { id: "v2", plate: "2ขข-5678", name: "6 ล้อ Hino", sinoDeviceId: "SINO-100002", driverId: "u-d2", active: true },
  ];
  const now = Date.now();
  const orders: Order[] = [
    {
      id: "o1",
      code: "DO-DEMO-0001",
      customerName: "ร้านสะดวกซื้อ ABC",
      customerPhone: "0812345678",
      note: null,
      status: ORDER_STATUS.BILLED,
      pickupAddress: null, pickupLat: null, pickupLng: null,
      deliveryAddress: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      deliveryLat: null, deliveryLng: null,
      createdAt: now - 3600_000, openedAt: null, acceptedAt: null, dispatchedAt: null, deliveredAt: null,
      issuerId: "u-issuer", pickerId: null, driverId: null, vehicleId: null,
      items: [
        { id: id("oi"), productId: "p1", qty: 10, pickedQty: 0 },
        { id: id("oi"), productId: "p2", qty: 5, pickedQty: 0 },
      ],
      statusLogs: [{ id: id("sl"), status: ORDER_STATUS.BILLED, note: "วางบิล/จ่ายสินค้า", userName: "สมชาย (จ่ายสินค้า)", createdAt: now - 3600_000 }],
    },
    {
      id: "o2",
      code: "DO-DEMO-0002",
      customerName: "บริษัท เดลต้า จำกัด",
      customerPhone: "0890001122",
      note: "ส่งก่อนเที่ยง",
      status: ORDER_STATUS.OPEN,
      pickupAddress: "คลังสินค้ากลาง พระราม 9",
      pickupLat: 13.758, pickupLng: 100.565,
      deliveryAddress: "99 อาคารเดลต้า ถนนรัชดาภิเษก กรุงเทพฯ",
      deliveryLat: 13.718, deliveryLng: 100.61,
      createdAt: now - 7200_000, openedAt: now - 1800_000, acceptedAt: null, dispatchedAt: null, deliveredAt: null,
      issuerId: "u-issuer", pickerId: "u-picker", driverId: null, vehicleId: null,
      items: [{ id: id("oi"), productId: "p3", qty: 20, pickedQty: 20 }],
      statusLogs: [
        { id: id("sl"), status: ORDER_STATUS.BILLED, note: "วางบิล/จ่ายสินค้า", userName: "สมชาย (จ่ายสินค้า)", createdAt: now - 7200_000 },
        { id: id("sl"), status: ORDER_STATUS.CHECKING, note: "เริ่มเช็คสินค้า", userName: "สมหญิง (จัดสินค้า)", createdAt: now - 2000_000 },
        { id: id("sl"), status: ORDER_STATUS.OPEN, note: "เปิดงาน รอคนขับรับ", userName: "สมหญิง (จัดสินค้า)", createdAt: now - 1800_000 },
      ],
    },
  ];
  return { users, products, vehicles, orders };
}

type DB = ReturnType<typeof seed>;

type StoreCtx = {
  db: DB;
  role: Role;
  currentUser: User;
  setRole: (r: Role) => void;
  // mutations
  createOrder: (d: { customerName: string; customerPhone: string; deliveryAddress: string; note: string; items: { productId: string; qty: number }[] }) => string;
  startChecking: (orderId: string) => void;
  openJob: (orderId: string, d: { picked: Record<string, number>; pickupAddress: string; pickupLat: number | null; pickupLng: number | null; deliveryLat: number | null; deliveryLng: number | null }) => void;
  claimJob: (orderId: string) => void;
  dispatchOrder: (orderId: string) => void;
  markDelivered: (orderId: string, note: string) => void;
  cancelOrder: (orderId: string, note: string) => void;
  adjustStock: (productId: string, delta: number) => void;
  addProduct: (d: { sku: string; name: string; unit: string; stockQty: number }) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

function code() {
  const d = new Date();
  const s = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `DO-${s}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seed());
  const [role, setRole] = useState<Role>(ROLES.ADMIN);

  const userByRole: Record<string, User> = {};
  for (const u of db.users) if (!userByRole[u.role]) userByRole[u.role] = u;
  const currentUser = userByRole[role] ?? db.users[0];

  const log = (o: Order, status: string, note: string): StatusLog => ({
    id: id("sl"), status, note, userName: currentUser.name, createdAt: Date.now(),
  });

  const update = (fn: (d: DB) => void) =>
    setDb((prev) => {
      const next: DB = structuredClone(prev);
      fn(next);
      return next;
    });

  const value: StoreCtx = useMemo(
    () => ({
      db,
      role,
      currentUser,
      setRole,
      createOrder: (d) => {
        const newId = id("o");
        update((n) => {
          n.orders.unshift({
            id: newId,
            code: code(),
            customerName: d.customerName,
            customerPhone: d.customerPhone || null,
            note: d.note || null,
            status: ORDER_STATUS.BILLED,
            pickupAddress: null, pickupLat: null, pickupLng: null,
            deliveryAddress: d.deliveryAddress,
            deliveryLat: null, deliveryLng: null,
            createdAt: Date.now(), openedAt: null, acceptedAt: null, dispatchedAt: null, deliveredAt: null,
            issuerId: currentUser.id, pickerId: null, driverId: null, vehicleId: null,
            items: d.items.map((i) => ({ id: id("oi"), productId: i.productId, qty: i.qty, pickedQty: 0 })),
            statusLogs: [{ id: id("sl"), status: ORDER_STATUS.BILLED, note: "วางบิล/จ่ายสินค้า", userName: currentUser.name, createdAt: Date.now() }],
          });
        });
        return newId;
      },
      startChecking: (orderId) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.status = ORDER_STATUS.CHECKING;
          o.pickerId = currentUser.id;
          o.statusLogs.push(log(o, ORDER_STATUS.CHECKING, "เริ่มเช็คสินค้า"));
        }),
      openJob: (orderId, d) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o) return;
          for (const it of o.items) {
            const picked = Math.max(0, Math.min(d.picked[it.id] ?? it.qty, it.qty));
            it.pickedQty = picked;
            const prod = n.products.find((p) => p.id === it.productId);
            if (prod) prod.stockQty -= picked;
          }
          o.status = ORDER_STATUS.OPEN;
          o.pickerId = currentUser.id;
          o.openedAt = Date.now();
          o.pickupAddress = d.pickupAddress || null;
          o.pickupLat = d.pickupLat; o.pickupLng = d.pickupLng;
          o.deliveryLat = d.deliveryLat; o.deliveryLng = d.deliveryLng;
          o.statusLogs.push(log(o, ORDER_STATUS.OPEN, "เปิดงาน รอคนขับรับ"));
        }),
      claimJob: (orderId) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o || o.status !== ORDER_STATUS.OPEN || o.driverId) return;
          const veh = n.vehicles.find((v) => v.driverId === currentUser.id);
          o.status = ORDER_STATUS.ACCEPTED;
          o.driverId = currentUser.id;
          o.vehicleId = veh?.id ?? null;
          o.acceptedAt = Date.now();
          o.statusLogs.push(log(o, ORDER_STATUS.ACCEPTED, "คนขับรับงาน"));
        }),
      dispatchOrder: (orderId) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.status = ORDER_STATUS.IN_TRANSIT;
          o.dispatchedAt = Date.now();
          o.statusLogs.push(log(o, ORDER_STATUS.IN_TRANSIT, "ออกรถจัดส่ง"));
        }),
      markDelivered: (orderId, note) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.status = ORDER_STATUS.DELIVERED;
          o.deliveredAt = Date.now();
          o.statusLogs.push(log(o, ORDER_STATUS.DELIVERED, note || "ส่งสำเร็จ"));
        }),
      cancelOrder: (orderId, note) =>
        update((n) => {
          const o = n.orders.find((x) => x.id === orderId);
          if (!o) return;
          o.status = ORDER_STATUS.CANCELLED;
          o.statusLogs.push(log(o, ORDER_STATUS.CANCELLED, note || "ยกเลิกบิล"));
        }),
      adjustStock: (productId, delta) =>
        update((n) => {
          const p = n.products.find((x) => x.id === productId);
          if (p) p.stockQty += delta;
        }),
      addProduct: (d) =>
        update((n) => {
          n.products.push({ id: id("p"), sku: d.sku, name: d.name, unit: d.unit || "ชิ้น", stockQty: d.stockQty });
        }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, role],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
