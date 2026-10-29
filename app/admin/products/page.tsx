"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/admin/AdminNav";

type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  image: string;
  stock: number;
  unit?: string;
};

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/admin/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load products"
          );
        }

        setProducts(data.products);
      } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
        setError("ไม่สามารถโหลดสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);



  const handleDelete = async (
  productId: number,
  productName: string
) => {
  const confirmed = window.confirm(
    `ต้องการลบสินค้า "${productName}" ใช่หรือไม่?`
  );

  if (!confirmed) return;

  try {
    const res = await fetch(
      `/api/admin/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

      if (!res.ok) {
          alert(
          data.error || "ไม่สามารถลบสินค้าได้"
        );
        return;
      }

    setProducts((current) =>
      current.filter(
        (product) => product.id !== productId
      )
    );

    alert("ลบสินค้าเรียบร้อย");
  } catch (error) {
      console.warn(
        "DELETE PRODUCT ERROR:",
        error
      );

    alert(
      error instanceof Error
        ? error.message
        : "ลบสินค้าไม่สำเร็จ"
    );
  }
};



  return (
<main className="min-h-screen bg-slate-50 text-slate-900">
  <div className="mx-auto max-w-7xl px-6 py-16">

    <AdminNav />

      <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-bold text-rose-700">
              ผู้ดูแล
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              จัดการสินค้า
            </h1>

            <p className="mt-2 text-slate-600">
              จัดการสินค้า ราคา และสต็อก
            </p>
          </div>


        </div>

        <div className="rounded-2xl bg-white p-6">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              สินค้า
            </h2>

            <button
              type="button"
              onClick={() => router.push("/admin/products/new")}
              className="rounded-xl bg-rose-600 px-5 py-3 font-bold hover:bg-rose-500"
            >
              + เพิ่มสินค้า
            </button>
          </div>

          {loading && (
            <div className="py-12 text-center text-slate-600">
              กำลังโหลดสินค้า…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-rose-700">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                ยังไม่มีสินค้า
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl bg-slate-100 p-5"
                  >
            <div className="flex items-center gap-4">

              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    ไม่มีรูป
                  </div>
                )}
              </div>

              <div>
                <p className="text-lg font-bold">
                  {product.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  รหัส: {product.id}
                </p>
              </div>

            </div>

                    <div className="flex items-center gap-10">
                      <div>
                        <p className="text-xs text-slate-500">
                          ราคาต่อหน่วย (บาท)
                        </p>

                        <p className="font-bold">
                          ฿{product.price.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          จำนวนคงเหลือ
                        </p>

                        <p
                          className={
                            product.stock <= 5
                              ? "font-bold text-rose-700"
                              : "font-bold text-green-700"
                          }
                        >
                          {product.stock} {product.unit || "ชิ้น"}
                        </p>
                      </div>

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/products/${product.id}`
                          )
                        }
                        className="
                          rounded-lg
                          bg-slate-200
                          px-4
                          py-2
                          font-bold
                          transition
                          hover:bg-zinc-600
                        "
                      >
                        แก้ไข
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.id,
                            product.name
                          )
                        }
                        className="
                          rounded-lg
                          bg-rose-600
                          px-4
                         py-2
                          font-bold
                          transition
                          hover:bg-rose-500
                        "
                      >
                        ลบ
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
  );
}
