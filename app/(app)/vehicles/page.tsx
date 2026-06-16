import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/constants";
import { updateVehicle } from "@/app/actions/vehicles";
import { AddVehicleForm } from "./AddVehicleForm";

export default async function VehiclesPage() {
  await requireRole(ROLES.ADMIN);
  const [vehicles, drivers] = await Promise.all([
    prisma.vehicle.findMany({ include: { driver: true }, orderBy: { plate: "asc" } }),
    prisma.user.findMany({ where: { role: ROLES.DRIVER, active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รถ & อุปกรณ์ GPS</h1>
        <p className="text-sm text-gray-500">
          ใส่ <span className="font-medium">Sino Device ID / IMEI</span> ของแต่ละคันเพื่อให้ดึงตำแหน่งจาก Sino Tracker บนหน้าติดตามรถ
        </p>
      </div>

      <AddVehicleForm drivers={drivers} />

      <div className="space-y-3">
        {vehicles.map((v) => (
          <form
            key={v.id}
            action={updateVehicle.bind(null, v.id)}
            className="card grid items-end gap-3 sm:grid-cols-5"
          >
            <div>
              <label className="label">ทะเบียน</label>
              <input className="input bg-gray-50" value={v.plate} disabled />
            </div>
            <div>
              <label className="label">ชื่อ/รุ่น</label>
              <input name="name" className="input" defaultValue={v.name ?? ""} />
            </div>
            <div>
              <label className="label">Sino Device ID</label>
              <input name="sinoDeviceId" className="input" defaultValue={v.sinoDeviceId ?? ""} placeholder="IMEI" />
            </div>
            <div>
              <label className="label">คนขับ</label>
              <select name="driverId" className="input" defaultValue={v.driverId ?? ""}>
                <option value="">— ไม่ระบุ —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button className="btn-primary w-full">บันทึก</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
