"use client";

import { useEffect, useState } from "react";

import ProductCard from "./product/ProductCard";
import type { Product } from "@/types/product";

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load products"
          );
        }

        const featuredProducts = data.products.filter(
          (product: Product) => product.featured
        );

        setProducts(featuredProducts);
      } catch (error) {
        console.error(
          "LOAD BEST SELLER ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดสินค้า Best Seller ได้"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="border-y border-slate-200 bg-[#f4eee8] py-14">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="mb-8 text-3xl font-bold tracking-tight text-[#71384f]">
          สินค้าแนะนำ
        </h2>

        {loading && (
          <p className="text-center text-slate-600">
            กำลังโหลดสินค้า…
          </p>
        )}

        {error && (
          <p className="text-center text-rose-700">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-slate-500">
            ยังไม่มีสินค้าแนะนำ
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
