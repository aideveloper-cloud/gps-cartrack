export const ROLES = {
  ADMIN: "ADMIN",
  ISSUER: "ISSUER",
  PICKER: "PICKER",
  DRIVER: "DRIVER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  ISSUER: "คนจ่ายสินค้า",
  PICKER: "คนจัดสินค้า",
  DRIVER: "คนขับ/คนส่ง",
};

export const ORDER_STATUS = {
  BILLED: "BILLED",
  CHECKING: "CHECKING",
  OPEN: "OPEN",
  ACCEPTED: "ACCEPTED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  BILLED: "วางบิลแล้ว รอเช็คสินค้า",
  CHECKING: "กำลังเช็คสินค้า",
  OPEN: "เปิดงาน รอคนขับรับ",
  ACCEPTED: "คนขับรับงานแล้ว",
  IN_TRANSIT: "กำลังจัดส่ง",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิก",
};

export const STATUS_COLORS: Record<string, string> = {
  BILLED: "bg-gray-100 text-gray-700",
  CHECKING: "bg-amber-100 text-amber-800",
  OPEN: "bg-teal-100 text-teal-800",
  ACCEPTED: "bg-purple-100 text-purple-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};
