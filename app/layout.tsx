import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {
  title: "STV BEAUTY | Beauty Fashion และ Brandname",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  description: "เครื่องสำอาง แฟชั่น และสินค้าแบรนด์เนมจาก STV BEAUTY",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{process.env.DEMO_CATALOG === "true" && <div className="bg-[#f1dfda] px-4 py-2 text-center text-xs leading-5 text-[#643746]">ตัวอย่างร้าน STV BEAUTY · สินค้า รูป ราคา และสต็อกเป็นข้อมูลตัวอย่าง · ยังไม่เปิดรับคำสั่งซื้อ</div>}{children}</body>
    </html>
  );
}
export const dynamic = "force-dynamic";
