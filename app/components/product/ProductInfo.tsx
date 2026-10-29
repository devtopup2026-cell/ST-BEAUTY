"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart.store";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductInfo({ product }: Props) {

  const { addItem, clear } = useCart();
  const router = useRouter();
  return (

    <div>

      <p className="text-slate-600 uppercase tracking-widest">
        {product.brand}
      </p>

      <h1 className="mt-2 text-3xl sm:text-4xl font-black">
        {product.name}
      </h1>

      <div className="mt-4 flex items-center gap-3">

        {product.reviewCount ? `⭐ ${product.rating}` : "ยังไม่มีรีวิว"}

        <span className="text-slate-500">
          {product.reviewCount ? `(${product.reviewCount} รีวิว)` : ""}
        </span>

      </div>

      <div className="mt-8">

        <div className="flex items-center gap-4">

          <span className="text-4xl font-semibold text-[#a34f65]">

            ฿{product.price.toLocaleString()} <span className="text-sm font-normal text-slate-600">/ {product.unit || "ชิ้น"}</span>

          </span>

          {product.compareAtPrice && (

            <span className="text-2xl line-through text-slate-500">

              ฿{product.compareAtPrice.toLocaleString()}

            </span>

          )}

        </div>

      </div>

{product.stock > 0 ? (
  <p className="mt-6 text-green-700 font-bold">
    ✔ มีสินค้า {product.stock} {product.unit || "ชิ้น"}
  </p>
) : (
  <p className="mt-6 text-rose-700 font-bold">
    ✖ สินค้าหมด
  </p>
)}

      <p className="mt-6 text-slate-600 leading-8">

        {product.description}

      </p>

      <div className="mt-10 flex flex-wrap gap-4">

<button
  disabled={product.stock <= 0}
  onClick={() => {
    if (product.stock <= 0) {
      return;
    }

    addItem(product);
    alert("เพิ่มสินค้าลงตะกร้าแล้ว");
  }}
  className={`flex-1 rounded-xl py-4 font-bold ${
    product.stock <= 0
      ? "cursor-not-allowed bg-slate-200 text-slate-600"
      : "bg-rose-600 text-white hover:bg-rose-500"
  }`}
>
  {product.stock <= 0
    ? "สินค้าหมด"
    : "เพิ่มลงตะกร้า"}
</button>

<button
  disabled={product.stock <= 0}
  onClick={() => {
  if (product.stock <= 0) {
    return;
  }

  clear();
  addItem(product);
  router.push("/checkout");
}}
  className={`rounded-xl border px-8 ${
    product.stock <= 0
      ? "cursor-not-allowed border-slate-300 text-slate-500"
      : "border-rose-500 hover:bg-rose-600"
  }`}
>
  สั่งซื้อสินค้า
</button>

      </div>

    </div>

  );

}
