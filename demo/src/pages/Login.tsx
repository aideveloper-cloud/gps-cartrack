import { useNavigate } from "react-router-dom";
import { ROLE_LABELS, type Role } from "../constants";
import { useStore } from "../store";

export function Login() {
  const { setRole } = useStore();
  const nav = useNavigate();

  const enter = (r: Role) => {
    setRole(r);
    nav("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🚚</div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">ระบบจัดการขนส่งสินค้า</h1>
          <p className="text-sm text-gray-500">เดโม UI — เลือกบทบาทเพื่อเข้าชม</p>
        </div>
        <div className="card space-y-2">
          {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
            <button key={role} onClick={() => enter(role)} className="btn-secondary w-full justify-between">
              <span>{label}</span>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          สลับบทบาทได้ตลอดเวลาจากมุมขวาบนหลังเข้าชม
        </p>
      </div>
    </main>
  );
}
