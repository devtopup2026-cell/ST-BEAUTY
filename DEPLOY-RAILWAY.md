# ตั้งค่า STV BEAUTY บน Railway

branch `codex/stv-full-store` เตรียมโค้ดใหม่สำหรับตรวจ ก่อนรวมเข้า `main` ที่เว็บเดิมใช้อยู่

## Variables ของบริการ ST-BEAUTY

- `DATABASE_URL`: อ้างอิง `${{Postgres.DATABASE_URL}}` จาก Postgres ใหม่ของ STV Beauty ที่ทดสอบแล้ว (ชื่อบริการต้องตรง)
- `DEMO_CATALOG=false`
- `PAYMENT_TEST_MODE=false` — โหมด TEST ใช้เฉพาะการเปิด dev บนเครื่อง
- `ADMIN_SESSION_SECRET` และ `CUSTOMER_SESSION_SECRET`: ค่าสุ่มอย่างน้อย 32 ตัวอักษรและต่างกัน
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: ใส่จากการตั้งค่าร้านบนเครื่อง โดยไม่ใส่ใน GitHub
- `NEXT_PUBLIC_PAYMENT_QR_URL` และ `NEXT_PUBLIC_PAYMENT_ACCOUNT_LABEL`: ข้อมูลรับเงินที่ถูกต้องของร้าน หากยังไม่ตั้ง ระบบจะปิดรับการชำระเงิน
- `NEXT_PUBLIC_STORE_PHONE`, `NEXT_PUBLIC_STORE_EMAIL`, `NEXT_PUBLIC_STORE_ADDRESS`, `NEXT_PUBLIC_STORE_LINE_URL`: ช่องทางติดต่อจริง
- `NEXT_PUBLIC_STORE_LEGAL_NAME`: ชื่อกิจการที่ต้องการแสดง

ตัวแปร NEXT_PUBLIC ต้องตั้งก่อน build เพื่อให้แสดงถูกต้องในฝั่งลูกค้า

ไม่ต้องตั้ง `SETUP_ADMIN_PASSWORD` บน Railway หากใช้ Postgres เดียวกับที่สร้างบัญชีผู้ดูแลไว้แล้ว และไม่ต้องสร้างบัญชีซ้ำ

## การปล่อยเว็บ

1. สำรองค่าการตั้งค่าบริการและฐานข้อมูลก่อนอัปเดต
2. รอ GitHub Actions ตรวจ branch ใหม่ผ่าน รวม production build บน Linux
3. ตั้ง Variables ของ ST-BEAUTY ให้ครบ และเก็บรหัสผ่านเฉพาะใน Railway
4. ตรวจว่า branch ที่ deploy ถูกต้อง แล้วรวม PR เข้า main เมื่อพร้อมอัปเดตเว็บ
5. Railway ใช้ `npm run build` และ `npm run start:railway` ตาม railway.json
6. คำสั่งเริ่มต้นจะรัน migrate deploy ก่อนเปิดเว็บ ตารางเดิมที่ migrate แล้วจะไม่สร้างซ้ำ
7. ตรวจหน้าแรก login หลังบ้าน สินค้า และบัญชีสมาชิกผ่าน URL จริง

## ผลการตรวจ

- ติดตั้ง dependencies ด้วย npm ci ผ่าน
- ตรวจ TypeScript ผ่าน
- ทดสอบ shipping/VAT, product units, payment policy, customer session, late slip authorization และ order list retries ผ่าน
- ผู้ใช้ทดสอบบนเครื่อง: เพิ่มสินค้า/รูป สมัครสมาชิก สร้าง TEST order อนุมัติ/ตัดสต็อก จัดส่ง/เสร็จสิ้น และแนบรูปภายหลังจนเปิดดูในหลังบ้านได้
- Production build บน Windows ยังติด EPERM ขณะสร้างโฟลเดอร์ .next จึงต้องยืนยันผล build จาก GitHub Actions/Linux ก่อนปล่อยเว็บ
- ไม่รวม .env.local ฐานข้อมูล node_modules generated client หรือ build output ใน Git
- ลบไฟล์ ZIP และรูปคอมพิวเตอร์เก่าที่ไม่ใช้จาก public แล้ว

ค่าส่ง 50 บาทและสูตร VAT เป็นกติกาปัจจุบันในโค้ด ต้องใช้ตามการตั้งค่าธุรกิจจริงของร้าน การรับชำระเงินเป็น QR/โอนและแอดมินตรวจหลักฐาน ไม่ได้ตรวจยอดกับธนาคารอัตโนมัติ
