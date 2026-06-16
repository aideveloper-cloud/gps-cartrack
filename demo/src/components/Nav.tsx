import { Link, useLocation } from "react-router-dom";
import { ROLE_LABELS, ROLES, type Role } from "../constants";
import { useStore } from "../store";

type NavLink = { href: string; label: string; roles: string[] };

const LINKS: NavLink[] = [
  { href: "/", label: "แดชบอร์ด", roles: ["*"] },
  { href: "/orders", label: "ใบจ่ายสินค้า", roles: ["*"] },
  { href: "/jobs", label: "งานที่เปิดรับ", roles: [ROLES.DRIVER, ROLES.ADMIN] },
  { href: "/products", label: "สินค้า/สต็อก", roles: [ROLES.ADMIN, ROLES.ISSUER] },
  { href: "/tracking", label: "ติดตามรถ", roles: [ROLES.ADMIN, ROLES.ISSUER, ROLES.DRIVER] },
  { href: "/vehicles", label: "รถ & GPS", roles: [ROLES.ADMIN] },
  { href: "/users", label: "ผู้ใช้งาน", roles: [ROLES.ADMIN] },
];

export function Nav() {
  const { role, setRole, currentUser } = useStore();
  const loc = useLocation();
  const links = LINKS.filter((l) => l.roles.includes("*") || l.roles.includes(role));

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-800">
        🧪 โหมดเดโม — ข้อมูลจำลองในเบราว์เซอร์ ไม่มีการบันทึกจริง (รีเฟรชแล้วรีเซ็ต)
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
            <span className="text-xl">🚚</span>
            <span>ขนส่งสินค้า</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => {
              const active = loc.pathname === l.href;
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-xs text-gray-500">ดูในมุมมอง</div>
          </div>
          <select
            className="input w-auto py-1.5"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {Object.entries(ROLE_LABELS).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-2 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href} to={l.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
