"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

useEffect(() => {
  const loadAdmin = async () => {
    try {
      const res = await fetch("/api/admin/me", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data.success && data.admin) {
        setRole(data.admin.role);
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    }
  };

  loadAdmin();
}, []);

const isSuperAdmin = role === "SUPER_ADMIN";


  const buttonClass = (active: boolean) =>
    `
      rounded-xl
      border
      px-5
      py-3
      text-sm
      font-bold
      transition
      ${
        active
          ? "border-rose-500 bg-rose-600 text-white"
          : "border-slate-300 bg-slate-100 text-slate-900 hover:border-rose-500 hover:text-rose-700"
      }
    `;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => router.push("/admin")}
        className={buttonClass(pathname === "/admin")}
      >
        ภาพรวม
      </button>

      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className={buttonClass(
          pathname.startsWith("/admin/products")
        )}
      >
        สินค้า
      </button>

        {isSuperAdmin && (
  <button
    type="button"
    onClick={() => router.push("/admin/order-manager")}
    className={buttonClass(
      pathname.startsWith("/admin/order-manager")
    )}
  >
    จัดการคำสั่งซื้อ
  </button>
)}


      <button
        type="button"
        onClick={() => router.push("/")}
        className={buttonClass(false)}
      >
        ดูหน้าร้าน
      </button>
    </div>
  );
}
