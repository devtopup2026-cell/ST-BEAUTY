# STV BEAUTY

ร้านค้า Next.js / PostgreSQL ที่ปรับจาก Miharu สำหรับ Beauty, Fashion และ Brandname

## ทดลองบนเครื่อง
1. ติดตั้ง Node.js 20.9 ขึ้นไป
2. npm ci
3. คัดลอก .env.example เป็น .env.local (ค่าเริ่มต้นเป็นหน้าร้านสาธิต)
4. npm run db:generate
5. npm run dev แล้วเปิด http://localhost:3000

## GitHub และ Railway
1. สำรอง repository และการตั้งค่าเดิมก่อนอัปเดต
2. นำไฟล์โปรเจกต์นี้ขึ้น branch ใหม่ใน GitHub รวมไฟล์ .gitignore และ .env.example แทนโครงสร้าง HTML เดิม
3. Railway ใช้ npm run build และ npm run start:railway ตาม railway.json
4. สร้าง PostgreSQL ใหม่สำหรับ STV BEAUTY และตั้ง DATABASE_URL ใน Railway Variables
5. ตั้ง DEMO_CATALOG=false พร้อม ADMIN_SESSION_SECRET และ CUSTOMER_SESSION_SECRET เป็นค่าสุ่มคนละค่าอย่างน้อย 32 ตัวอักษร
6. ตั้ง Cloudinary ทั้งสามค่า รูปแยกโฟลเดอร์ stvbeauty/products และ stvbeauty/slips
7. ตั้ง NEXT_PUBLIC_PAYMENT_QR_URL และ NEXT_PUBLIC_PAYMENT_ACCOUNT_LABEL ด้วยข้อมูลรับเงินจริงของร้าน
8. ตั้งข้อมูลติดต่อ NEXT_PUBLIC_STORE_PHONE, NEXT_PUBLIC_STORE_EMAIL, NEXT_PUBLIC_STORE_ADDRESS และ NEXT_PUBLIC_STORE_LINE_URL ตามจริง
9. Deploy: คำสั่งเริ่มต้นจะสร้างตารางด้วย prisma migrate deploy ก่อนเปิดเว็บ
10. ตั้ง SETUP_ADMIN_EMAIL และ SETUP_ADMIN_PASSWORD (อย่างน้อย 12 ตัว) แล้วรัน npm run admin:create ในบริการเดียวกันผ่าน Railway CLI หรือเชื่อมฐานข้อมูลจากเครื่อง
11. ลบ SETUP_ADMIN_PASSWORD ออกจาก Variables หลังสร้างผู้ดูแลสำเร็จ และเข้า /admin/login
12. เพิ่มสินค้าจริงด้วยหลังบ้าน ข้อมูลสาธิตไม่ถูกนำเข้าฐานข้อมูลโดยอัตโนมัติ

## ก่อนเปิดขาย
- ระบบชำระเงินเป็นโอน/QR พร้อมอัปโหลดสลิปและตรวจโดยผู้ดูแล ไม่ใช่ตัดบัตรหรือตรวจสลิปอัตโนมัติ
- ค่าส่ง 50 บาทต่อคำสั่งซื้อ และ VAT 7% จากสินค้า+ค่าส่ง เป็นกติกาที่สืบทอดจาก Miharu ต้องยืนยันความเหมาะสมกับร้านก่อนเปิดขาย
- Brandname เป็นหมวดสินค้า สินค้าพรีออเดอร์ต้องกำหนดเงื่อนไขและสต็อกจริง ไม่มีกระบวนการมัดจำแยก
- ทดสอบสมัครสมาชิก เพิ่มสินค้า ตะกร้า ออเดอร์ อัปโหลดสลิป สถานะและสต็อกกับฐานข้อมูลใหม่ก่อนเปิดขาย
- ไม่รวม .env.local รหัสผ่าน ฐานข้อมูล หรือบัญชีจาก Miharu
- URL เดิม .html มี redirects ไปหน้าร้านใหม่

## ตรวจระบบ
npm run typecheck
npm run test:store
npm run build
