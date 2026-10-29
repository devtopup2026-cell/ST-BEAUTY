"use client";
import {shippingQuoteReason} from "@/lib/bulky-products";
import {categories as productCategories} from "@/lib/store-config";
import {productUnits} from "@/lib/product-units";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import AdminNav from "@/app/components/admin/AdminNav";

type ProductForm = {
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

const [form, setForm] = useState<ProductForm>({
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
  stock: "",

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

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/admin/products/${productId}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load product"
          );
        }

setForm({
  name: data.product.name,
  slug: data.product.slug,

  brand: data.product.brand || "",
  category: data.product.category || "",
  unit: data.product.unit || "ชิ้น",
  weightKg: data.product.weightKg == null ? "" : String(data.product.weightKg),
  requiresShippingQuote: false,

  description:
    data.product.description || "",

  price: String(data.product.price),

  compareAtPrice:
    data.product.compareAtPrice != null
      ? String(data.product.compareAtPrice)
      : "",

  image: data.product.image,
  stock: String(data.product.stock),

  featured: Boolean(data.product.featured),
  isNew: Boolean(data.product.isNew),
});

setImagePreview(data.product.image);

      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product"
        );

      } finally {
        setLoading(false);
      }
    };

    loadProduct();

  }, [productId]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

  };

  const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setImageFile(file);

  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);
};

const uploadProductImage = async () => {
  if (!imageFile) {
    return form.image;
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
};


  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

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

      if (!form.name.trim()) {
        throw new Error("กรุณากรอกชื่อสินค้า");
      }

      if (!form.slug.trim()) {
        throw new Error("กรุณากรอก Slug");
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("ราคาสินค้าไม่ถูกต้อง");
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error("จำนวน Stock ไม่ถูกต้อง");
      }

      if (!form.image.trim()) {
        throw new Error("กรุณาระบุรูปสินค้า");
      }

      const imageUrl = await uploadProductImage();

      const res = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

body: JSON.stringify({
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
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update product"
        );
      }

      alert("แก้ไขสินค้าเรียบร้อย");

      router.push("/admin/products");
      router.refresh();

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "แก้ไขสินค้าไม่สำเร็จ"
      );

    } finally {
      setSaving(false);
    }
  };

return (
  <main className="min-h-screen bg-slate-50 text-slate-900">

    <div className="mx-auto max-w-5xl px-6 py-16">

      <AdminNav />

      <p className="font-bold text-rose-700">
        ผู้ดูแล
      </p>

        <h1 className="mt-2 text-4xl font-bold">
          แก้ไขสินค้า
        </h1>

        <p className="mt-2 text-slate-600">
          รหัสสินค้า: {productId}
        </p>


        {loading ? (

          <div className="mt-10 rounded-2xl bg-white p-8 text-slate-600">
            กำลังโหลดสินค้า…
          </div>

        ) : error && !form.name ? (

          <div className="mt-10 rounded-2xl bg-white p-8 text-rose-700">
            {error}
          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-2xl bg-white p-8"
          >

            <h2 className="mb-8 text-2xl font-bold">
              ข้อมูลสินค้า
            </h2>


            <div className="grid gap-6 md:grid-cols-2">

              <label className="block">

                <span className="font-bold">
                  ชื่อสินค้า
                </span>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


              <label className="block">

                <span className="font-bold">
                  ชื่อในลิงก์สินค้า (Slug)
                </span>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />

              </label>


              <label className="block">
  <span className="font-bold">
    แบรนด์
  </span>

  <input
    name="brand"
    value={form.brand}
    onChange={handleChange}
    className={inputClass}
    required
  />
</label>


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
                  className={inputClass}
                  required
                />

              </label>


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
    className={inputClass}
    placeholder="26900"
  />
</label>


<label className="block"><span className="font-bold">น้ำหนักต่อหน่วย (กก.)</span><input type="number" min="0.001" step="any" value={form.weightKg} onChange={e=>setForm(prev=>({...prev,weightKg:e.target.value}))} className={inputClass}/><p className="mt-2 text-sm text-slate-600">ใช้น้ำหนักรวมบรรจุภัณฑ์ หากไม่ทราบให้เว้นว่าง</p></label><p className="text-sm text-stone-500">จัดส่งแบบพัสดุปกติ ค่าส่งแสดงในหน้าชำระเงิน</p>
<label className="block"><span className="font-bold">หน่วยขาย</span><select name="unit" value={form.unit} onChange={e=>setForm(prev=>({...prev,unit:e.target.value}))} className={inputClass} required>{productUnits.map(unit=><option key={unit} value={unit}>{unit}</option>)}</select><p className="mt-2 text-sm text-slate-600">ราคาและสต็อกคิดต่อหน่วยที่เลือก จำนวนสั่งซื้อเป็นจำนวนเต็ม</p></label>
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
                  className={inputClass}
                  required
                />

              </label>


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


              <div className="md:col-span-2">

                <span className="font-bold">
                  รูปสินค้า
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="
                    mt-2
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
                      รูปปัจจุบัน / รูปใหม่
                    </p>

                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="
                        h-64
                        w-64
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


              <label className="block md:col-span-2">

                <span className="font-bold">
                  รายละเอียด
                </span>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  className={inputClass}
                />

              </label>

            </div>


            {error && (
              <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-rose-700">
                {error}
              </div>
            )}


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
                    : "บันทึกการแก้ไข"}
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

        )}

      </div>

    </main>
  );
}
