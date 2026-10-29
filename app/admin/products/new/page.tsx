"use client";
import {shippingQuoteReason} from "@/lib/bulky-products";
import {categories as productCategories} from "@/lib/store-config";
import {productUnits} from "@/lib/product-units";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/app/components/admin/AdminNav";


type ProductForm = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  unit: string;
  weightKg: string;
  requiresShippingQuote: boolean;
  description: string;
  price: string;
  compareAtPrice: string;
  image: string;
  stock: string;
  featured: boolean;
  isNew: boolean;
};

export default function NewProductPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");
const [uploading, setUploading] = useState(false);

function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setImageFile(file);

  const preview = URL.createObjectURL(file);
  setImagePreview(preview);
}

async function uploadProductImage() {
  if (!imageFile) {
    throw new Error("Please select a product image");
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch(
      "/api/admin/products/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.error || "Image upload failed"
      );
    }

    return data.url as string;
  } finally {
    setUploading(false);
  }
}

    const [form, setForm] = useState<ProductForm>({
   id: "",
   name: "",
   slug: "",
   brand: "",
   category: "",
  unit: "ชิ้น",
  weightKg: "",
  requiresShippingQuote: false,
   description: "",
   price: "",
   compareAtPrice: "",
   image: "",
   stock: "0",
   featured: false,
   isNew: false,
});
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((current) => ({
      ...current,
      name: value,
      slug: generatedSlug,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const productId = Number(form.id);
      const price = Number(form.price);
      const stock = Number(form.stock);

      const compareAtPrice =
  form.compareAtPrice.trim() === ""
    ? null
    : Number(form.compareAtPrice);

    if (
  compareAtPrice !== null &&
  (
    !Number.isFinite(compareAtPrice) ||
    compareAtPrice < 0
  )
) {
  throw new Error("Compare Price ไม่ถูกต้อง");
}


      if (!Number.isInteger(productId)) {
        throw new Error("Product ID ไม่ถูกต้อง");
      }

      if (!form.name.trim()) {
        throw new Error("กรุณากรอกชื่อสินค้า");
      }

      if (!form.slug.trim()) {
        throw new Error("กรุณากรอก Slug");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("ราคาสินค้าไม่ถูกต้อง");
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("จำนวน Stock ไม่ถูกต้อง");
      }

     if (!imageFile) {
      throw new Error("กรุณาเลือกรูปสินค้า");
    }

        const imageUrl = await uploadProductImage();

        const res = await fetch("/api/admin/products", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

        body: JSON.stringify({
        id: productId,
        name: form.name.trim(),
        slug: form.slug.trim(),

        brand: form.brand.trim(),
        category: form.category,
  unit: form.unit,
  weightKg: form.weightKg === "" ? null : Number(form.weightKg),
  requiresShippingQuote: form.requiresShippingQuote || !!shippingQuoteReason(form.name,form.category),

        description:
         form.description.trim() || null,

        price,
        compareAtPrice,

        image: imageUrl,
        stock,

        featured: form.featured,
        isNew: form.isNew,
      }),
    });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create product"
        );
      }

      alert("เพิ่มสินค้าเรียบร้อย");

      router.push("/admin/products");
      router.refresh();

    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "เพิ่มสินค้าไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

return (
  <main className="min-h-screen bg-slate-50 text-slate-900">

    <div className="mx-auto max-w-5xl px-6 py-16">

      <AdminNav />

      <div className="mb-10">

          <p className="font-bold text-rose-700">
            ผู้ดูแล
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            เพิ่มสินค้า
          </h1>

          <p className="mt-2 text-slate-600">
            เพิ่มสินค้าใหม่สำหรับร้าน STV BEAUTY
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8"
        >

          <h2 className="mb-8 text-2xl font-bold">
            ข้อมูลสินค้า
          </h2>


          <div className="grid gap-6 md:grid-cols-2">

            {/* Product ID */}

            <label className="block">

              <span className="font-bold">
                รหัสสินค้า
              </span>

              <input
                name="id"
                type="number"
                value={form.id}
                onChange={handleChange}
                placeholder="5001"
                className={inputClass}
                required
              />

            </label>


            {/* Name */}

            <label className="block">

              <span className="font-bold">
                ชื่อสินค้า
              </span>

              <input
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="ชื่อสินค้า เช่น เซรั่มบำรุงผิว"
                className={inputClass}
                required
              />

            </label>


            {/* Slug */}

            <label className="block md:col-span-2">

              <span className="font-bold">
                ชื่อในลิงก์สินค้า (Slug)
              </span>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="cement-50kg"
                className={inputClass}
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                ระบบสร้างจากชื่อสินค้าให้อัตโนมัติ และสามารถแก้เองได้
              </p>

            </label>

            {/* Brand */}

            <label className="block">
              <span className="font-bold">
                แบรนด์
              </span>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="ชื่อแบรนด์สินค้า"
                className={inputClass}
                required
              />
            </label>


            {/* Category */}

            <label className="block">
              <span className="font-bold">
                หมวดหมู่
              </span>

              <select
                name="category"
                value={form.category}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    category: e.target.value,
                  }))
                }
                className={inputClass}
                required
              >
                <option value="">
                  เลือกหมวดหมู่
                </option>

                {productCategories.map(category=><option key={category} value={category}>{category}</option>)}
              </select>
            </label>


            {/* Price */}

            <label className="block">

              <span className="font-bold">
                ราคาต่อหน่วย (บาท)
              </span>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="145"
                className={inputClass}
                required
              />

            </label>

                {/*Compare Price*/}

                <label className="block">
                  <span className="font-bold">
                    ราคาเดิม (ถ้ามี)
                  </span>

                  <input
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={handleChange}
                    placeholder="ราคาเดิม (ถ้ามี)"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    ไม่ใส่ได้ หากสินค้าไม่มีราคาเดิมก่อนลด
                  </p>
                </label>



<label className="block"><span className="font-bold">น้ำหนักต่อหน่วย (กก.)</span><input type="number" min="0.001" step="any" value={form.weightKg} onChange={e=>setForm(prev=>({...prev,weightKg:e.target.value}))} className={inputClass}/><p className="mt-2 text-sm text-slate-600">ใช้น้ำหนักรวมบรรจุภัณฑ์ หากไม่ทราบให้เว้นว่าง</p></label><p className="text-sm text-stone-500">จัดส่งแบบพัสดุปกติ ค่าส่งแสดงในหน้าชำระเงิน</p>
<label className="block"><span className="font-bold">หน่วยขาย</span><select name="unit" value={form.unit} onChange={e=>setForm(prev=>({...prev,unit:e.target.value}))} className={inputClass} required>{productUnits.map(unit=><option key={unit} value={unit}>{unit}</option>)}</select><p className="mt-2 text-sm text-slate-600">ราคาและสต็อกคิดต่อหน่วยที่เลือก จำนวนสั่งซื้อเป็นจำนวนเต็ม</p></label>
            {/* Stock */}

            <label className="block">

              <span className="font-bold">
                จำนวนคงเหลือ
              </span>

              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                className={inputClass}
                required
              />

            </label>


            {/* Image */}

            <div>
              <label className="block mb-2 font-semibold">
                รูปสินค้า
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-slate-100
                  p-4
                  text-slate-900
                "
              />

              <p className="mt-2 text-sm text-slate-500">
                JPG, PNG หรือ WEBP — ขนาดไม่เกิน 5 MB
              </p>

              {imagePreview && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-slate-600">
                    ตัวอย่างรูป
                  </p>

                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="
                      h-56
                      w-56
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      object-contain
                      p-3
                    "
                  />
                </div>
              )}
            </div>

                {/*Featured และ New Product*/}

              <div className="flex items-center gap-6 md:col-span-2">

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            featured: e.target.checked,
                          }))
                        }
                        className="h-5 w-5"
                      />

                      <span className="font-bold">
                        สินค้าแนะนำ
                      </span>
                    </label>


                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.isNew}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            isNew: e.target.checked,
                          }))
                        }
                        className="h-5 w-5"
                      />

                      <span className="font-bold">
                        สินค้าใหม่
                      </span>
                    </label>

                  </div>



            {/* Description */}

            <label className="block md:col-span-2">

              <span className="font-bold">
                รายละเอียด
              </span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="รายละเอียดสินค้า เช่น น้ำหนัก ขนาด วิธีใช้งาน และการจัดส่ง"
                className={inputClass}
              />

            </label>

          </div>


          {/* Error */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-rose-700">
              {error}
            </div>
          )}


          {/* Actions */}

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              type="submit"
              disabled={saving || uploading}
              className="
                rounded-xl
                bg-rose-600
                px-7
                py-4
                font-bold
                transition
                hover:bg-rose-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
                {uploading
                  ? "Uploading image..."
                  : saving
                  ? "กำลังบันทึก…"
                : "เพิ่มสินค้า"}
            </button>


            <button
              type="button"
              disabled={saving}
              onClick={() =>
                router.push("/admin/products")
              }
              className="
                rounded-xl
                bg-slate-200
                px-7
                py-4
                font-bold
                transition
                hover:bg-zinc-600
              "
            >
              ยกเลิก
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
