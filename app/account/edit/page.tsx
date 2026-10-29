"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
};

export default function EditAccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const res = await fetch("/api/customer/me", {
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success || !data.customer) {
          setError(data.error || "ไม่สามารถโหลดข้อมูลสมาชิกได้");
          return;
        }

        const currentCustomer = data.customer as Customer;

        setCustomer(currentCustomer);
        setFullName(currentCustomer.fullName);
        setPhone(currentCustomer.phone);
        setAddress(currentCustomer.address);
        setPostalCode(currentCustomer.postalCode);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !postalCode.trim()
    ) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/customer/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          postalCode,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error || "ไม่สามารถบันทึกข้อมูลได้");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
        <div className="text-center">
          <p className="text-rose-700">
            {error || "ไม่พบข้อมูลสมาชิก"}
          </p>

          <Link
            href="/account"
            className="mt-5 inline-block text-sm text-slate-600 hover:text-slate-900"
          >
            ← กลับไปบัญชีของฉัน
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/account"
          className="text-sm text-slate-600 transition hover:text-rose-700"
        >
          ← กลับไปบัญชีของฉัน
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">แก้ไขข้อมูลส่วนตัว</h1>

          <p className="mt-2 text-sm text-slate-500">
            แก้ไขข้อมูลสำหรับบัญชีและการจัดส่งสินค้า
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-600">
                อีเมล
              </label>

              <input
                type="email"
                value={customer.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-500 outline-none"
              />

              <p className="mt-2 text-xs text-zinc-600">
                อีเมลของบัญชียังไม่สามารถแก้ไขได้
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">
                ชื่อ-นามสกุล
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">
                เบอร์โทรศัพท์
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">
                ที่อยู่
              </label>

              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">
                รหัสไปรษณีย์
              </label>

              <input
                type="text"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-rose-500"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/account"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-medium text-slate-900 transition hover:border-zinc-500"
              >
                ยกเลิก
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
