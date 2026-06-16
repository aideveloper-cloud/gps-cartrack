import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🚚</div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            ระบบจัดการขนส่งสินค้า
          </h1>
          <p className="text-sm text-gray-500">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <div className="mt-4 rounded-lg bg-white/70 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-600">บัญชีทดลอง (รหัสผ่าน: password123)</p>
          <ul className="mt-1 space-y-0.5">
            <li>admin@demo.com — ผู้ดูแลระบบ</li>
            <li>issuer@demo.com — คนจ่ายสินค้า</li>
            <li>picker@demo.com — คนจัดสินค้า</li>
            <li>driver1@demo.com — คนขับ</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
