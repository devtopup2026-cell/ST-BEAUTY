"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/store/cart.store";


export default function CartPage() {
  const {
    items,
    increase,
    decrease,
    removeItem,
    totalPrice,
    clear,
  } = useCart();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50 text-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <h1 className="mb-10 text-3xl sm:text-5xl font-semibold">
            ตะกร้าสินค้า
          </h1>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

              <h2 className="text-3xl font-bold">
                ตะกร้าสินค้าว่าง
              </h2>

              <p className="mt-4 text-slate-600">
                ยังไม่มีสินค้าในตะกร้า
              </p>

              <Link
                href="/products"
                className="mt-8 inline-block rounded-xl bg-rose-600 px-8 py-4 font-bold hover:bg-rose-500"
              >
                เลือกซื้อสินค้า
              </Link>

            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-3">

              {/* รายการสินค้า */}
              <div className="lg:col-span-2 space-y-6">

                {items.map((item) => (

                  <div
                    key={item.product.id}
                    className="flex flex-col gap-6 sm:flex-row rounded-2xl border border-slate-200 bg-white p-5"
                  >

                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl">

                      <Image
                        src={item.product.thumbnail ?? item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />

                    </div>

                    <div className="flex-1">

                      <h2 className="text-2xl font-bold">
                        {item.product.name}
                      </h2>

                      <p className="mt-2 text-slate-600">
                        {item.product.brand}
                      </p>

                      <p className="mt-4 text-2xl font-black text-rose-700">
                        ฿{item.product.price.toLocaleString()} / {item.product.unit || "ชิ้น"}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">

                        <button
                            disabled={item.quantity === 1}
                            onClick={() => decrease(item.product.id)}
                          className="h-10 w-10 rounded-lg bg-slate-100"
                        >
                          -
                        </button>

                        <span className="text-xl font-bold">
                          {item.quantity} {item.product.unit || "ชิ้น"}
                        </span>

                        <button
                          onClick={() => increase(item.product.id)}
                          className="h-10 w-10 rounded-lg bg-slate-100"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item.product.id)}
                              className="
                              rounded-lg
                              border
                              border-rose-500
                              px-4
                              py-2
                              text-rose-700
                              hover:bg-rose-600
                              hover:text-white
                              transition
                              "
                        >
                          นำออก
                        </button>

                      </div>

                      <p className="mt-3 text-slate-600">
  รวม&nbsp;
  <span className="font-bold text-slate-900">
    ฿{(item.product.price * item.quantity).toLocaleString()}
  </span>
</p>
                    </div>

                  </div>

                ))}

              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 h-fit">

                <h2 className="text-3xl font-bold">
                  สรุปรายการ
                </h2>

                <div className="mt-8 flex justify-between">

                  <span>ยอดรวม</span>

                  <span className="text-3xl font-black text-rose-700">
                    ฿{totalPrice().toLocaleString()}
                  </span>

                </div>

                <Link
                   href="/checkout"
                   className="
                   mt-10
                   flex
                   w-full
                   items-center
                   justify-center
                   rounded-xl
                   bg-rose-600
                   py-4
                   font-bold
                   hover:bg-rose-500
                   "
                   >
                       ดำเนินการสั่งซื้อ
                </Link>


                <button
                  onClick={clear}
                  className="mt-4 w-full rounded-xl border border-rose-500 py-4 hover:bg-rose-600"
                >
                  ล้างตะกร้า
                </button>

              </div>

            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}
