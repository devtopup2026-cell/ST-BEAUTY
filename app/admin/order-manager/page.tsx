"use client";
import ShippingSummary from '@/app/components/ShippingSummary';

import {orderStatusLabel} from "@/lib/order-labels";
import {useAdminOrders} from "@/hooks/useAdminOrders";
import TestOrderBadge from '@/app/components/TestOrderBadge';


import AdminNav from "@/app/components/admin/AdminNav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
};

export default function OrderManagerPage() {
const router = useRouter();

  const {orders,setOrders,loading,loadError,loadOrders} = useAdminOrders<Order>();
  const [searchTerm, setSearchTerm] = useState("");


  // ======================================================
  // Load Orders
  // ======================================================

  // ======================================================
  // Search
  // ======================================================

  const search = searchTerm
    .trim()
    .toLowerCase();

  const filteredOrders = orders.filter((order) => {
  if (!search) return true;

  return (
    order.id.toLowerCase().includes(search) ||
    order.recipientName
      .toLowerCase()
      .includes(search) ||
    order.recipientEmail
      .toLowerCase()
      .includes(search) ||
    order.recipientPhone
      .toLowerCase()
      .includes(search)
  );
});

  // ======================================================
  // Status Style
  // ======================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending Payment":
        return "text-amber-700";

      case "Paid":
        return "text-green-700";

      case "Shipping":
        return "text-rose-400";

      case "Completed":
        return "text-green-700";

      case "Rejected":
        return "text-rose-700";

      default:
        return "text-white";
    }
  };

return (
  <>
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <AdminNav />
      </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">

          <div className="mb-10">

            <p className="mb-2 font-bold text-rose-700">
              ผู้ดูแลหลัก
            </p>

            <h1 className="text-5xl font-black">
              จัดการคำสั่งซื้อ
            </h1>

            <p className="mt-3 text-slate-600">
              ค้นหาและแก้ไขข้อมูลลูกค้าและคำสั่งซื้อ
            </p>

          </div>


          {/* Search */}

          <div className="rounded-2xl bg-white p-8">

            <h2 className="mb-5 text-2xl font-bold">
              ค้นหาออเดอร์
            </h2>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="ค้นหาเลขออเดอร์ ชื่อลูกค้า อีเมล หรือเบอร์โทร…"
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                bg-slate-100
                px-5
                py-4
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-rose-500
              "
            />

          </div>


          {/* Orders */}

          <div className="mt-8 rounded-2xl bg-white p-8">

            <div className="mb-6 flex items-center justify-between gap-4">

              <h2 className="text-3xl font-bold">
                รายการออเดอร์
              </h2>

              <p className="text-slate-600">
                {loading || loadError ? "—" : filteredOrders.length} orders
              </p>

            </div>


            {loading ? (

              <p className="text-slate-600">
                กำลังโหลดรายการสั่งซื้อ...
              </p>

            ) : loadError ? (
    <div role="alert" className="rounded-xl border border-amber-500 bg-amber-50 p-5 text-amber-900"><p>{loadError}</p><p className="mt-2 text-sm">ยังยืนยันรายการล่าสุดไม่ได้ ไม่ได้ส่งคำสั่งเปลี่ยนสถานะซ้ำ</p><button type="button" onClick={()=>void loadOrders()} className="mt-4 rounded-lg bg-rose-600 px-5 py-3 font-bold text-white">ลองโหลดใหม่</button></div>
  ) : orders.length === 0 ? (

              <p className="text-slate-600">
                ยังไม่มีรายการสั่งซื้อ
              </p>

            ) : filteredOrders.length === 0 ? (

              <div className="rounded-2xl bg-slate-100 p-8 text-center">

                <p className="text-xl font-bold">
                  ไม่พบรายการสั่งซื้อ
                </p>

                <p className="mt-2 text-slate-600">
                  ลองค้นหาด้วยเลขออเดอร์ ชื่อลูกค้า อีเมล หรือเบอร์โทร
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {filteredOrders.map((order) => (

                  <div
                    key={order.id}
                    className="
                      rounded-2xl
                      border
                      border-slate-300
                      bg-slate-100
                      p-6
                    "
                  >

                    <div className="
                      flex
                      flex-col
                      gap-6
                      xl:flex-row
                      xl:items-center
                      xl:justify-between
                    ">

                      <div>

                        <h3 className="text-2xl font-black text-rose-700">
                          {order.id} <TestOrderBadge id={order.id}/><ShippingSummary order={order}/>
                        </h3>

                        <div className="mt-4 space-y-1 text-slate-600">

                          <p>
                            <span className="font-bold text-slate-900">
                              ลูกค้า :
                            </span>{" "}
                            {order.recipientName}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              โทรศัพท์ :
                            </span>{" "}
                            {order.recipientPhone}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              ยอดรวม :
                            </span>{" "}
                            ฿{order.total.toLocaleString()}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              สถานะ :
                            </span>{" "}

                            <span
                              className={`font-bold ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {orderStatusLabel(order.status)}
                            </span>

                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              วันที่สร้าง :
                            </span>{" "}

                            {new Date(
                              order.createdAt
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>


                      <div className="shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/order-manager/${order.id}`
                        )
                      }
                      className="
                        rounded-xl
                        bg-rose-600
                        px-7
                        py-4
                        font-bold
                        transition
                        hover:bg-rose-500
                      "
                    >
                      แก้ไขออเดอร์
                    </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>
      </main>
    </>
  );
}
