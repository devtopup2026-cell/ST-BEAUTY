"use client";
import BrandLogo from "@/app/components/BrandLogo";


import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password และ Confirm Password ไม่ตรงกัน");
      return;
    }

    if (form.password.length < 8) {
      setError("Password ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
          postalCode: form.postalCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง"
        );
        return;
      }

      alert("สมัครสมาชิกสำเร็จ");

      router.push("/login");
    } catch (error) {
      console.error("REGISTER_ERROR:", error);

      setError(
        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-wider"
          >
            <BrandLogo/>
          </Link>

          <h1 className="mt-6 text-2xl font-bold">
            สมัครสมาชิก
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            สมัครสมาชิก STV BEAUTY
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
                ชื่อ-นามสกุล
              </label>

              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) =>
                  updateField("fullName", e.target.value)
                }
                placeholder="ชื่อ-นามสกุล"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                อีเมล
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="example@email.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  รหัสผ่าน
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    updateField("password", e.target.value)
                  }
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  ยืนยันรหัสผ่าน
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  placeholder="ยืนยัน Password"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                เบอร์โทรศัพท์
              </label>

              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                placeholder="08xxxxxxxx"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                ที่อยู่
              </label>

              <textarea
                required
                rows={4}
                value={form.address}
                onChange={(e) =>
                  updateField("address", e.target.value)
                }
                placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                รหัสไปรษณีย์
              </label>

              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) =>
                  updateField("postalCode", e.target.value)
                }
                placeholder="10100"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-rose-600 px-4 py-3 font-bold transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "กำลังสมัครสมาชิก…" : "สมัครสมาชิก"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-medium text-rose-700 hover:text-rose-700"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
