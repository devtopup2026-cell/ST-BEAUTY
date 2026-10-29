"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      alert("ออกจากระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="
        rounded-xl
        border
        border-rose-500
        px-5
        py-3
        font-bold
        text-rose-700
        transition
        hover:bg-rose-600
        hover:text-white
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {loading ? "Logging out..." : "ออกจากระบบ"}
    </button>
  );
}
