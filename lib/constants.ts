// Centralized enums (stored as strings because SQLite has no native enums).

export const ROLES = {
  ADMIN: "ADMIN",
  ISSUER: "ISSUER", // คนจ่ายสินค้า
  PICKER: "PICKER", // คนจัดสินค้า
  DRIVER: "DRIVER", // คนขับ/คนส่ง
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  ISSUER: "คนจ่ายสินค้า",
  PICKER: "คนจัดสินค้า",
  DRIVER: "คนขับ/คนส่ง",
};

export const ORDER_STATUS = {
  BILLED: "BILLED", // Issuer วางบิลแล้ว รอ Picker เช็คสินค้า
  CHECKING: "CHECKING", // Picker กำลังเช็ค/จัดสินค้า
  OPEN: "OPEN", // เปิดงานแล้ว รอคนขับกดรับ (job pool)
  ACCEPTED: "ACCEPTED", // คนขับรับงานแล้ว (ล็อก) รอออกรถ
  IN_TRANSIT: "IN_TRANSIT", // กำลังจัดส่ง
  DELIVERED: "DELIVERED", // ส่งสำเร็จ
  CANCELLED: "CANCELLED", // ยกเลิก
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const STATUS_LABELS: Record<string, string> = {
  BILLED: "วางบิลแล้ว รอเช็คสินค้า",
  CHECKING: "กำลังเช็คสินค้า",
  OPEN: "เปิดงาน รอคนขับรับ",
  ACCEPTED: "คนขับรับงานแล้ว",
  IN_TRANSIT: "กำลังจัดส่ง",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิก",
};

// Tailwind classes for status badges.
export const STATUS_COLORS: Record<string, string> = {
  BILLED: "bg-gray-100 text-gray-700",
  CHECKING: "bg-amber-100 text-amber-800",
  OPEN: "bg-teal-100 text-teal-800",
  ACCEPTED: "bg-purple-100 text-purple-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};
