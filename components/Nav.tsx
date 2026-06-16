import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth";

type NavLink = { href: string; label: string; roles: string[] };

const LINKS: NavLink[] = [
  { href: "/", label: "แดชบอร์ด", roles: ["*"] },
  { href: "/orders", label: "ใบจ่ายสินค้า", roles: ["*"] },
  { href: "/jobs", label: "งานที่เปิดรับ", roles: [ROLES.DRIVER, ROLES.ADMIN] },
  { href: "/products", label: "สินค้า/สต็อก", roles: [ROLES.ADMIN, ROLES.ISSUER] },
  { href: "/tracking", label: "ติดตามรถ", roles: [ROLES.ADMIN, ROLES.ISSUER, ROLES.DRIVER] },
  { href: "/vehicles", label: "รถ & GPS", roles: [ROLES.ADMIN] },
  { href: "/admin/users", label: "ผู้ใช้งาน", roles: [ROLES.ADMIN] },
];

export function Nav({ user }: { user: SessionUser }) {
  const links = LINKS.filter(
    (l) => l.roles.includes("*") || l.roles.includes(user.role),
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
            <span className="text-xl">🚚</span>
            <span>ขนส่งสินค้า</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</div>
          </div>
          <form action={logout}>
            <button className="btn-secondary" type="submit">
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-2 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
