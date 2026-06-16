import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบจัดการขนส่งสินค้า",
  description: "รับ-จ่ายสินค้า จัดสินค้า และติดตามการจัดส่งด้วย GPS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
