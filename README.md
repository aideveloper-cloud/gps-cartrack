# ระบบจัดการขนส่งสินค้า (GPS Cartrack)

ระบบจัดการการจ่าย–จัด–ส่งสินค้า พร้อมติดตามรถด้วย GPS (เชื่อมต่อ **Sino Tracker**)

## Flow การทำงาน

```
Issuer วางบิล          Picker เช็คสินค้า              Driver กดรับงานเอง
(ลูกค้า+รายการสินค้า)  + ปักหมุดจุดรับ/จุดส่ง          (ล็อก รับได้คนเดียว)
        │              + เปิดงาน                            │
        ▼                     │                             ▼
   [วางบิลแล้ว] ──► [กำลังเช็ค] ──► [เปิดงาน รอคนขับ] ──► [รับงานแล้ว] ──► [กำลังส่ง] ──► [ส่งสำเร็จ]
```

## ฟีเจอร์หลัก

- **บิลจ่ายสินค้า** ตามขั้นตอนข้างบน พร้อมไทม์ไลน์สถานะทุกขั้น
- **4 บทบาทผู้ใช้** พร้อมสิทธิ์แยกกัน
  - `ADMIN` ผู้ดูแลระบบ — เห็นและจัดการทุกอย่าง
  - `ISSUER` คนจ่ายสินค้า — วางบิล (ลูกค้า/ผู้รับ + รายการสินค้า), จัดการสต็อก
  - `PICKER` คนจัดสินค้า — เช็คสินค้า (ตัดสต็อก), ปักหมุดจุดรับ-ส่งบนแผนที่, เปิดงาน
  - `DRIVER` คนขับ/คนส่ง — เห็น pool งานที่เปิด **กดรับงานเอง** (ล็อกคนเดียว) ออกรถ ยืนยันส่ง
- **จุดรับ-ส่ง 2 จุด** (ต้นทาง/ปลายทาง) ปักหมุดบนแผนที่ + ลิงก์เส้นทาง Google Maps
- **จัดการรถ + ผูก Sino Device ID (IMEI)** ต่อคนขับ (ใช้รถของคนขับเองตอนติดตาม GPS)
- **ติดตามรถแบบเรียลไทม์** บนแผนที่ (Leaflet + OpenStreetMap) รีเฟรชทุก 5 วินาที

## เทคโนโลยี

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite (สลับเป็น PostgreSQL ได้)
- Auth แบบ session cookie + bcrypt
- Leaflet สำหรับแผนที่

## เริ่มใช้งาน

```bash
npm install
npm run setup        # generate Prisma client + สร้าง DB + ใส่ข้อมูลตัวอย่าง
npm run dev          # http://localhost:3000
```

### บัญชีทดลอง (รหัสผ่าน: `password123`)

| อีเมล | บทบาท |
|---|---|
| admin@demo.com | ผู้ดูแลระบบ |
| issuer@demo.com | คนจ่ายสินค้า |
| picker@demo.com | คนจัดสินค้า |
| driver1@demo.com | คนขับ |

## การเชื่อมต่อ Sino Tracker จริง

ค่าเริ่มต้นใช้ GPS แบบ **จำลอง** (รถวิ่งวนรอบกรุงเทพฯ) เพื่อให้ทดสอบได้ทันที

เมื่อพร้อมเชื่อมต่อของจริง ให้แก้ไฟล์ `.env`:

```env
GPS_PROVIDER="sino"
SINO_API_BASE="https://<โฮสต์แพลตฟอร์ม Sino ของคุณ>"
SINO_API_TOKEN="<token>"
```

แล้วปรับโค้ดส่วนเรียก API จริงใน [`lib/gps/sino.ts`](lib/gps/sino.ts)
(เมธอด `fetchRaw` = endpoint/พารามิเตอร์ และ `mapPosition` = การแปลงข้อมูลให้เป็นรูปแบบกลาง)
โดยที่ส่วนอื่นของระบบไม่ต้องแก้ เพราะคุยผ่าน interface `GpsProvider` เดียวกัน

จากนั้นใส่ **Sino Device ID / IMEI** ของแต่ละคันในหน้า **รถ & GPS**

## โครงสร้างหลัก

```
app/
  (app)/            หน้าใช้งานหลัง login (dashboard, orders, products, vehicles, tracking, admin)
  actions/          server actions (auth, orders, products, vehicles, users)
  api/positions/    API ดึงตำแหน่งรถ
  login/
lib/
  auth.ts           session + role guard
  db.ts             Prisma client
  gps/              GpsProvider abstraction (mock + sino)
  constants.ts      enum บทบาท/สถานะ
prisma/
  schema.prisma     โครงฐานข้อมูล
  seed.mjs          ข้อมูลตัวอย่าง
```
