"use client";
import BrandLogo from "@/app/components/BrandLogo";


import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);

      setError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-wider"
          >
            <BrandLogo/>
          </Link>

          <h1 className="mt-6 text-2xl font-bold">
            เข้าสู่ระบบ
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            เข้าสู่ระบบสมาชิก STV BEAUTY
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-2xl sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                อีเมล
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                รหัสผ่าน
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-rose-600 px-4 py-3 font-bold transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="font-medium text-rose-700 hover:text-rose-700"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 transition hover:text-slate-900"
            >
              ← กลับหน้าร้าน
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
