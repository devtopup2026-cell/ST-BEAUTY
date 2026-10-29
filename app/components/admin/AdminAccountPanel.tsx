"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLogoutButton from "./AdminLogoutButton";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminAccountPanel() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          return;
        }

        setAdmin(data.admin);
      } catch (error) {
        console.error("LOAD ADMIN ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-slate-500">
        กำลังโหลดข้อมูลผู้ดูแล…
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const isSuperAdmin =
    admin.role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <p className="text-sm text-slate-600">
          เข้าสู่ระบบในชื่อ
        </p>

        <p className="mt-1 text-lg font-bold">
          {admin.name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">

          <span
            className={`
              rounded-lg
              px-3
              py-1
              text-xs
              font-bold
              ${
                isSuperAdmin
                  ? "bg-rose-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }
            `}
          >
            {admin.role}
          </span>

          <span className="text-sm text-slate-500">
            {admin.email}
          </span>

        </div>
      </div>


      <div className="flex flex-wrap gap-3">

  <button
    type="button"
    onClick={() => router.push("/admin")}
    className="
      rounded-xl
      border
      border-slate-300
      bg-slate-100
      px-5
      py-3
      font-bold
      text-slate-900
      transition
      hover:border-rose-500
      hover:text-rose-700
    "
  >
    ภาพรวม
  </button>

  <button
    type="button"
    onClick={() => router.push("/admin/products")}
    className="
      rounded-xl
      border
      border-slate-300
      bg-slate-100
      px-5
      py-3
      font-bold
      text-slate-900
      transition
      hover:border-rose-500
      hover:text-rose-700
    "
  >
    สินค้า
  </button>

  {isSuperAdmin && (
    <button
      type="button"
      onClick={() => router.push("/admin/order-manager")}
      className="
        rounded-xl
        bg-rose-600
        px-5
        py-3
        font-bold
        text-white
        transition
        hover:bg-rose-500
      "
    >
      จัดการคำสั่งซื้อ
    </button>
  )}

  <button
    type="button"
    onClick={() => router.push("/")}
    className="
      rounded-xl
      border
      border-slate-300
      bg-slate-100
      px-5
      py-3
      font-bold
      text-slate-900
      transition
      hover:border-rose-500
      hover:text-rose-700
    "
  >
    ดูหน้าร้าน
  </button>

  <AdminLogoutButton />

</div>

      </div>


  );
}
