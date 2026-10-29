"use client";
import ShippingSummary from '@/app/components/ShippingSummary';

import {orderStatusLabel} from "@/lib/order-labels";
import {useAdminOrders} from "@/hooks/useAdminOrders";
import TestOrderBadge from '@/app/components/TestOrderBadge';



import { useEffect, useState } from "react";
import AdminAccountPanel from "@/app/components/admin/AdminAccountPanel";

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

  total: number;
  itemsSubtotal?: number;
  shippingFee?: number;
  vatAmount?: number;
  vatRate?: number;
  shippingMethod?: string;
  paymentMethod: string;
  paymentSlip: string | null;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const {orders,setOrders,loading,loadError,loadOrders} = useAdminOrders<Order>();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // ======================================================
  // Load Orders
  // ======================================================

  // ======================================================
  // Update Order Status
  // ======================================================

  const updateOrderStatus = async (
    id: string,
    status: string
  ) => {
    try {
      setUpdatingId(id);

      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update order"
        );
      }

      // Update หน้าจอทันที
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );

    } catch (error) {
      console.error("UPDATE ORDER ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถเปลี่ยนสถานะ Order ได้"
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // ======================================================
  // Dashboard
  // ======================================================
  const filteredOrders = orders.filter((order) => {
  const matchesStatus =
    statusFilter === "All" ||
    order.status === statusFilter;

  const search = searchTerm
    .trim()
    .toLowerCase();

const matchesSearch =
  search === "" ||
  order.id.toLowerCase().includes(search) ||
  order.recipientName.toLowerCase().includes(search) ||
  order.recipientEmail.toLowerCase().includes(search) ||
  order.recipientPhone.toLowerCase().includes(search);

  return matchesStatus && matchesSearch;
});

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending Payment"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

const today = new Date();

const todaySales = orders
  .filter((order) => {
    const orderDate = new Date(order.createdAt);

    const isToday =
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate();

    const isSale =
      order.status === "Paid" ||
      order.status === "Shipping" ||
      order.status === "Completed";

    return isToday && isSale && !order.id.startsWith("TEST-");
  })
  .reduce(
    (total, order) => total + order.total,
    0
  );


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

const toggleOrderDetails = (orderId: string) => {
  setExpandedOrders((current) =>
    current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]
  );
};

  return (
    <>

      <main className="min-h-screen bg-slate-50 text-slate-900">

        <div className="max-w-7xl mx-auto px-6 py-16">

      <div className="mb-10">

          <h1 className="text-5xl font-bold">
            หลังบ้าน STV BEAUTY
          </h1>

          <div className="mt-6 rounded-2xl bg-white p-6">
            <AdminAccountPanel />
        </div>

      </div>


          {/* ======================================================
              Dashboard
          ====================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-slate-600 mb-2">
                ออเดอร์ทั้งหมด
              </h2>

              <p className="text-4xl font-bold text-rose-700">
                {loading || loadError ? "—" : totalOrders}
              </p>
            </div>


            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-slate-600 mb-2">
                รอตรวจสอบ
              </h2>

              <p className="text-4xl font-bold text-yellow-500">
                {loading || loadError ? "—" : pendingOrders}
              </p>
            </div>


            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-slate-600 mb-2">
                เสร็จสิ้น
              </h2>

              <p className="text-4xl font-bold text-green-700">
                {loading || loadError ? "—" : completedOrders}
              </p>
            </div>


            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-slate-600 mb-2">
                ยอดขายวันนี้
              </h2>

              <p className="text-4xl font-bold text-rose-700">
                {loading || loadError ? "—" : "฿"+todaySales.toLocaleString()}
              </p>
            </div>

          </div>


          {/* ======================================================
              Orders
          ====================================================== */}

          <div className="bg-white rounded-2xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              ออเดอร์ล่าสุด
            </h2>

            <div className="mb-6">
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

            <div className="flex flex-wrap gap-3 mb-6">

  {[
    "All",
    "Pending Payment",
    "Paid",
    "Shipping",
    "Completed",
    "Rejected",
  ].map((status) => (

    <button
      key={orderStatusLabel(status)}
      onClick={() => setStatusFilter(status)}
      className={`
        rounded-xl
        px-5
        py-3
        font-bold
        transition
        ${
          statusFilter === status
            ? "bg-rose-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }
      `}
    >
      {status}
    </button>

  ))}

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
    <p className="text-xl font-bold text-slate-900">
      ไม่พบรายการสั่งซื้อ
    </p>

    <p className="mt-2 text-slate-600">
      ลองเปลี่ยนคำค้นหาหรือสถานะออเดอร์
    </p>
  </div>
) : (
  filteredOrders.map((order) => (

                <div
                  key={order.id}
                  className="mt-6 rounded-2xl bg-slate-100 p-6"
                >

                  {/* ======================================================
                      Order Header
                  ====================================================== */}

                  <h2 className="text-3xl font-bold text-rose-700">
                    {order.id} <TestOrderBadge id={order.id}/><ShippingSummary order={order}/>
                  </h2>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="rounded-xl bg-white p-4">
    <p className="text-sm text-slate-600">
      ลูกค้า
    </p>

    <p className="font-bold">
      {order.recipientName}
    </p>
  </div>

  <div className="rounded-xl bg-white p-4">
    <p className="text-sm text-slate-600">
      ยอดรวม
    </p>

    <p className="font-bold">
      ฿{order.total.toLocaleString()}
    </p>
  </div>

  <div className="rounded-xl bg-white p-4">
    <p className="text-sm text-slate-600">
      สถานะ
    </p>

    <p className={`font-bold ${getStatusClass(order.status)}`}>
      {orderStatusLabel(order.status)}
    </p>
  </div>

</div>

<button
  onClick={() => toggleOrderDetails(order.id)}
  className="
    mt-5
    rounded-xl
    bg-slate-200
    px-6
    py-3
    font-bold
    hover:bg-zinc-600
  "
>
  {expandedOrders.includes(order.id)
    ? "ซ่อนรายละเอียด"
    : "ดูรายละเอียด"}
</button>

{expandedOrders.includes(order.id) && (

   <>
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* Customer Information */}

  <div className="rounded-2xl bg-white p-6">

    <h3 className="text-xl font-bold mb-5">
      ข้อมูลผู้รับสินค้า
    </h3>

    <div className="space-y-3 text-slate-600">

      <p>
        <span className="font-bold text-slate-900">
          ชื่อ :
        </span>{" "}
        {order.recipientName}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          อีเมล :
        </span>{" "}
        {order.recipientEmail}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          โทรศัพท์ :
        </span>{" "}
        {order.recipientPhone}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          ที่อยู่ :
        </span>{" "}
        {order.shippingAddress}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          รหัสไปรษณีย์ :
        </span>{" "}
        {order.shippingPostalCode}
      </p>

    </div>

  </div>


  {/* Order Information */}

  <div className="rounded-2xl bg-white p-6">

    <h3 className="text-xl font-bold mb-5">
      ข้อมูลออเดอร์
    </h3>

    <div className="space-y-3 text-slate-600">

      <p>
        <span className="font-bold text-slate-900">
          การชำระเงิน :
        </span>{" "}
        {order.paymentMethod}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          ยอดรวม :
        </span>{" "}
        ฿{order.total.toLocaleString()}
      </p>

      <p>
        <span className="font-bold text-slate-900">
          รายการสินค้า :
        </span>{" "}
        {order.items.length}
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

</div>


                  {/* ======================================================
                      Products
                  ====================================================== */}

                  <div className="mt-6">

                    <h3 className="text-xl font-bold mb-3">
                      สินค้า
                    </h3>


                    {order.items.map((item) => (

                      <div
                        key={item.id}
                        className="mb-3 rounded-xl bg-slate-200 p-4"
                      >

                        <p className="font-bold">
                          {item.product.name}
                        </p>

                        <p>
                          จำนวน : {item.quantity} {item.unit || "ชิ้น"}
                        </p>

                        <p>
                          ฿{item.price.toLocaleString()}
                        </p>

                      </div>

                    ))}

                  </div>


                  {/* ======================================================
                      Slip
                  ====================================================== */}

                  {order.paymentSlip && (

                    <button
                      onClick={() =>
                        window.open(
                          order.paymentSlip!,
                          "_blank"
                        )
                      }

                      className="
                        mt-4
                        rounded-xl
                        bg-blue-600
                        px-6
                        py-3
                        font-bold
                        hover:bg-blue-500
                      "
                    >
                      ดูรูปแนบ
                    </button>

                  )}


                  {/* ======================================================
                      Order Actions
                  ====================================================== */}

                  <div className="flex flex-wrap gap-3 mt-6">


                    {/* Approve */}

                    {order.status === "Pending Payment" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Paid"
                          )
                        }

                        className="
                          rounded-xl
                          bg-green-600
                          px-6
                          py-3
                          font-bold
                          hover:bg-green-500
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "กำลังอัปเดต…"
                          : "อนุมัติ"}
                      </button>

                    )}


                    {/* Shipping */}

                    {order.status === "Paid" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Shipping"
                          )
                        }

                        className="
                          rounded-xl
                          bg-rose-500
                          px-6
                          py-3
                          font-bold
                          hover:bg-rose-400
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "กำลังอัปเดต…"
                          : "กำลังจัดส่ง"}
                      </button>

                    )}


                    {/* Complete */}

                    {order.status === "Shipping" && (

                      <button
                        disabled={
                          updatingId === order.id
                        }

                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "Completed"
                          )
                        }

                        className="
                          rounded-xl
                          bg-purple-600
                          px-6
                          py-3
                          font-bold
                          hover:bg-purple-500
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {updatingId === order.id
                          ? "กำลังอัปเดต…"
                          : "เสร็จสิ้น"}
                      </button>

                    )}


                    {/* Reject */}

                    {order.status !== "Completed" &&
                      order.status !== "Rejected" && (

                        <button
                          disabled={
                            updatingId === order.id
                          }

                          onClick={() => {

                            const confirmed =
                              window.confirm(
                                "ต้องการ Reject Order นี้ใช่หรือไม่?"
                              );

                            if (!confirmed) {
                              return;
                            }

                            updateOrderStatus(
                              order.id,
                              "Rejected"
                            );

                          }}

                          className="
                            rounded-xl
                            bg-rose-600
                            px-6
                            py-3
                            font-bold
                            hover:bg-rose-500
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          {updatingId === order.id
                            ? "กำลังอัปเดต…"
                            : "ยกเลิก / ไม่อนุมัติ"}
                        </button>

                      )}

                  </div>

                  </>
                )}

                </div>

              ))

            )}

          </div>

        </div>

      </main>
    </>
  );
}
