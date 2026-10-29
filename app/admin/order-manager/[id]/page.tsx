"use client";
import ShippingSummary from '@/app/components/ShippingSummary';

import {orderStatusLabel} from "@/lib/order-labels";
import TestOrderBadge from '@/app/components/TestOrderBadge';


import AdminNav from "@/app/components/admin/AdminNav";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  id: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
  };

  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingPostalCode: string;

  total: number;
  itemsSubtotal?: number;
  shippingFee?: number;
  vatAmount?: number;
  vatRate?: number;
  shippingMethod?: string;
  paymentMethod: string;
  status: string;
  createdAt: string;

  items: {
    id: string;
    quantity: number;
    unit: string;
    price: number;

    product: {
      id: number;
      name: string;
      image: string;
    };
  }[];
};

type EditForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  total: string;
  date: string;
  time: string;
};

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<EditForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    total: "",
    date: "",
    time: "",
  });

  // ======================================================
  // Load Order
  // ======================================================

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/order/${encodeURIComponent(orderId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load order"
          );
        }

        const loadedOrder: Order = data.order;

        setOrder(loadedOrder);

        const created = new Date(loadedOrder.createdAt);

        const year = created.getFullYear();
        const month = String(
          created.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          created.getDate()
        ).padStart(2, "0");

        const hours = String(
          created.getHours()
        ).padStart(2, "0");

        const minutes = String(
          created.getMinutes()
        ).padStart(2, "0");

        setForm({
          fullName: loadedOrder.recipientName,
          email: loadedOrder.recipientEmail,
          phone: loadedOrder.recipientPhone,
          address: loadedOrder.shippingAddress,
          postalCode: loadedOrder.shippingPostalCode,
          total: String(loadedOrder.total),
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}`,
        });

      } catch (error) {
        console.error("LOAD ORDER ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load order"
        );

      } finally {
        setLoading(false);
      }
    };

    loadOrder();

  }, [orderId]);

  // ======================================================
  // Change Input
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // Save
  // ======================================================

  const handleSave = async () => {
    try {
      if (!form.fullName.trim()) {
        alert("กรุณากรอกชื่อลูกค้า");
        return;
      }

      if (!form.email.trim()) {
        alert("กรุณากรอก Email");
        return;
      }

      if (!form.phone.trim()) {
        alert("กรุณากรอกเบอร์โทร");
        return;
      }

      if (!form.date || !form.time) {
        alert("กรุณาระบุวันที่และเวลา");
        return;
      }

      const total = Number(form.total);

      if (!Number.isFinite(total) || total < 0) {
        alert("ยอดเงินไม่ถูกต้อง");
        return;
      }

      setSaving(true);

      // สร้าง DateTime จากวันที่ + เวลา
      const createdAt = new Date(
        `${form.date}T${form.time}:00`
      ).toISOString();

      const res = await fetch(
        `/api/order/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            recipientName: form.fullName.trim(),
            recipientEmail: form.email.trim(),
            recipientPhone: form.phone.trim(),
            shippingAddress: form.address.trim(),
            shippingPostalCode: form.postalCode.trim(),
            total,
            createdAt,
    }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update order"
        );
      }

      setOrder(data.order);

      alert("บันทึกข้อมูลเรียบร้อย");

      router.push("/admin/order-manager");

    } catch (error) {
      console.error("SAVE ORDER ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "บันทึกข้อมูลไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // Input Style
  // ======================================================

  const inputClass = `
    mt-2
    w-full
    rounded-xl
    border
    border-slate-300
    bg-slate-100
    px-4
    py-3
    text-slate-900
    outline-none
    transition
    focus:border-rose-500
  `;

return (
  <>
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="mx-auto max-w-5xl px-6 pt-10">
        <AdminNav />
      </div>

        <div className="mx-auto max-w-5xl px-6 py-16">

          <p className="font-bold text-rose-700">
            ผู้ดูแลหลัก
          </p>

          <h1 className="mt-2 text-5xl font-black">
            แก้ไขออเดอร์
          </h1>

          {loading && (
            <div className="mt-10 rounded-2xl bg-white p-8">

              <p className="text-slate-600">
                กำลังโหลดข้อมูลออเดอร์...
              </p>

            </div>
          )}

          {!loading && error && (
            <div className="mt-10 rounded-2xl bg-white p-8">

              <p className="font-bold text-rose-700">
                {error}
              </p>

            </div>
          )}

          {!loading && order && (
            <>

              {/* Order ID */}

              <div className="mt-10 rounded-2xl bg-white p-8">

                <p className="text-slate-600">
                  เลขออเดอร์
                </p>

                <h2 className="mt-2 text-3xl font-black text-rose-700">
                  {order.id} <TestOrderBadge id={order.id}/><ShippingSummary order={order}/>
                </h2>

              </div>


              <div className="mt-6 grid gap-6 md:grid-cols-2">

                {/* Customer Information */}

                <div className="rounded-2xl bg-white p-8">

                  <h2 className="mb-6 text-2xl font-bold">
                    ข้อมูลผู้รับสินค้า
                  </h2>

                  <div className="space-y-5">

                    <label className="block">
                      <span className="font-bold">
                        ชื่อผู้รับ
                      </span>

                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        อีเมล
                      </span>

                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        โทรศัพท์
                      </span>

                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        ที่อยู่
                      </span>

                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows={4}
                        className={inputClass}
                      />
                    </label>


                    <label className="block">
                      <span className="font-bold">
                        รหัสไปรษณีย์
                      </span>

                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </label>

                  </div>

                </div>


                {/* Order Information */}

                <div className="rounded-2xl bg-white p-8">

                  <h2 className="mb-6 text-2xl font-bold">
                    ข้อมูลออเดอร์
                  </h2>

                  <div className="space-y-5">

                    <label className="block">

                      <span className="font-bold">
                        ยอดรวม
                      </span>

                      <input
                        name="total"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.total}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <label className="block">

                      <span className="font-bold">
                        วันที่
                      </span>

                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <label className="block">

                      <span className="font-bold">
                        เวลา
                      </span>

                      <input
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
                        className={inputClass}
                      />

                    </label>


                    <div className="rounded-xl bg-slate-100 p-5">

                      <p className="text-sm text-slate-600">
                        การชำระเงิน
                      </p>

                      <p className="mt-1 font-bold">
                        {order.paymentMethod}
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-100 p-5">

                      <p className="text-sm text-slate-600">
                        สถานะ
                      </p>

                      <p className="mt-1 font-bold">
                        {orderStatusLabel(order.status)}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* Products */}

              <div className="mt-6 rounded-2xl bg-white p-8">

                <h2 className="mb-6 text-2xl font-bold">
                  สินค้า
                </h2>

                <div className="space-y-3">

                  {order.items.map((item) => (

                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-100 p-5"
                    >

                      <p className="font-bold">
                        {item.product.name}
                      </p>

                      <p className="text-slate-600">
                        จำนวน : {item.quantity} {item.unit || "ชิ้น"}
                      </p>

                      <p className="text-slate-600">
                        ฿{item.price.toLocaleString()}
                      </p>

                    </div>

                  ))}

                </div>

              </div>


              {/* Buttons */}

              <div className="mt-6 flex flex-wrap gap-4">

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-rose-600
                    px-8
                    py-4
                    font-bold
                    transition
                    hover:bg-rose-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "กำลังบันทึก…"
                    : "บันทึกการแก้ไข"}
                </button>


                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/order-manager"
                    )
                  }
                  disabled={saving}
                  className="
                    rounded-xl
                    bg-slate-200
                    px-8
                    py-4
                    font-bold
                    transition
                    hover:bg-zinc-600
                  "
                >
                  ยกเลิก
                </button>

              </div>

            </>
          )}

        </div>

      </main>
    </>
  );
}
