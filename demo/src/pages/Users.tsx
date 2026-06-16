import { useStore } from "../store";
import { ROLE_LABELS } from "../constants";

export function Users() {
  const { db } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ผู้ใช้งาน</h1>

      <form className="card grid items-end gap-3 sm:grid-cols-5">
        <div><label className="label">ชื่อ *</label><input className="input" /></div>
        <div><label className="label">อีเมล *</label><input className="input" type="email" /></div>
        <div>
          <label className="label">บทบาท *</label>
          <select className="input" defaultValue="DRIVER">
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className="label">รหัสผ่าน *</label><input className="input" /></div>
        <div><button type="button" className="btn-primary w-full">+ เพิ่มผู้ใช้</button></div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="th">ชื่อ</th><th className="th">อีเมล</th><th className="th">บทบาท</th><th className="th">สถานะ</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {db.users.map((u) => (
              <tr key={u.id}>
                <td className="td font-medium">{u.name}</td>
                <td className="td">{u.email}</td>
                <td className="td">{ROLE_LABELS[u.role] ?? u.role}</td>
                <td className="td"><span className="badge bg-green-100 text-green-800">ใช้งาน</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
