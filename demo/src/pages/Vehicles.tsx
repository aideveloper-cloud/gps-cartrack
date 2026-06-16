import { useStore } from "../store";
import { ROLES } from "../constants";

export function Vehicles() {
  const { db } = useStore();
  const drivers = db.users.filter((u) => u.role === ROLES.DRIVER && u.active);
  const driverName = (id: string | null) => db.users.find((u) => u.id === id)?.name ?? "— ไม่ระบุ —";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รถ & อุปกรณ์ GPS</h1>
        <p className="text-sm text-gray-500">ผูก <span className="font-medium">Sino Device ID / IMEI</span> ของแต่ละคันเพื่อดึงตำแหน่งจาก Sino Tracker</p>
      </div>

      <div className="space-y-3">
        {db.vehicles.map((v) => (
          <div key={v.id} className="card grid items-end gap-3 sm:grid-cols-5">
            <div><label className="label">ทะเบียน</label><input className="input bg-gray-50" value={v.plate} disabled /></div>
            <div><label className="label">ชื่อ/รุ่น</label><input className="input" defaultValue={v.name ?? ""} /></div>
            <div><label className="label">Sino Device ID</label><input className="input" defaultValue={v.sinoDeviceId ?? ""} placeholder="IMEI" /></div>
            <div>
              <label className="label">คนขับ</label>
              <select className="input" defaultValue={v.driverId ?? ""}>
                <option value="">— ไม่ระบุ —</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><button className="btn-primary w-full">บันทึก</button></div>
            <p className="text-xs text-gray-400 sm:col-span-5">คนขับปัจจุบัน: {driverName(v.driverId)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
