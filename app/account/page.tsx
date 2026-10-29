import OrderSlipUpload from '@/app/components/customer/OrderSlipUpload';
import BrandLogo from "@/app/components/BrandLogo";
import ShippingSummary from '@/app/components/ShippingSummary';
import {orderStatusLabel} from "@/lib/order-labels";
import TestOrderBadge from '@/app/components/TestOrderBadge';
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomerSession } from "@/lib/customer-session";
import { prisma } from "@/lib/prisma";
import CustomerLogoutButton from "@/app/components/customer/CustomerLogoutButton";


export default async function AccountPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/login");
  }


  const orders = await prisma.order.findMany({
  where: {
    customerId: customer.id,
  },
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-2xl font-black tracking-wider"
            >
              <BrandLogo/>
            </Link>

            <h1 className="mt-5 text-3xl font-bold">
              บัญชีของฉัน
            </h1>

            <p className="mt-2 text-slate-600">
              ยินดีต้อนรับ {customer.fullName}
            </p>
          </div>

<div className="flex flex-wrap items-center gap-3">
  <Link
    href="/account/edit"
    className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
  >
    แก้ไขข้อมูลส่วนตัว
  </Link>

  <Link
    href="/"
    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:border-rose-500 hover:text-rose-700"
  >
    ← กลับหน้าร้าน
  </Link>

  <CustomerLogoutButton />
</div>

        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:col-span-1">
            <h2 className="text-lg font-bold">
              ข้อมูลสมาชิก
            </h2>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-slate-500">
                  ชื่อ-นามสกุล
                </p>
                <p className="mt-1 text-slate-900">
                  {customer.fullName}
                </p>
              </div>

              <div>
                <p className="text-slate-500">อีเมล</p>
                <p className="mt-1 break-all text-slate-900">
                  {customer.email}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  เบอร์โทรศัพท์
                </p>
                <p className="mt-1 text-slate-900">
                  {customer.phone}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  ที่อยู่
                </p>
                <p className="mt-1 whitespace-pre-line text-slate-900">
                  {customer.address}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  รหัสไปรษณีย์
                </p>
                <p className="mt-1 text-slate-900">
                  {customer.postalCode}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  ประวัติคำสั่งซื้อ
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  ประวัติการสั่งซื้อของคุณ
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
  <div className="mt-8 rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
    <p className="text-slate-600">
      ยังไม่มีประวัติการสั่งซื้อ
    </p>

    <p className="mt-2 text-sm text-zinc-600">
      เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่
    </p>

    <Link
      href="/products"
      className="mt-6 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
    >
      เลือกซื้อสินค้า
    </Link>
  </div>
) : (
  <div className="mt-6 space-y-4">
    {orders.map((order) => (
      <div
        key={order.id}
        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-500">
              เลขออเดอร์
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {order.id} <TestOrderBadge id={order.id}/><ShippingSummary order={order}/>
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-slate-500">
              สถานะ
            </p>

            <p className="mt-1 font-semibold text-rose-700">
              {orderStatusLabel(order.status)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {item.product.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  จำนวน {item.quantity} {item.unit || "ชิ้น"}
                </p>
              </div>

              <p className="whitespace-nowrap text-sm text-slate-600">
                ฿
                {(
                  item.price * item.quantity
                ).toLocaleString("th-TH")}
              </p>
            </div>
          ))}
        </div>

        <OrderSlipUpload id={order.id} slip={order.paymentSlip} status={order.status}/>
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-sm text-slate-500">
            {new Intl.DateTimeFormat("th-TH", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Bangkok",
            }).format(order.createdAt)}
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-slate-500">
              ยอดรวม
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              ฿{order.total.toLocaleString("th-TH")}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
          </section>
        </div>
      </div>
    </main>
  );
}
