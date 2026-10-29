"use client";

import Header from "../components/layout/Header";
import Footer from "../components/Footer";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductToolbar from "../components/product/ProductToolbar";
import ProductFilter from "../components/product/ProductFilter";
import ProductGrid from "../components/product/ProductGrid";

import useProducts from "../../hooks/useProducts";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  const productsPerPage = 6;

  const {
    search,
    setSearch,

    category,
    setCategory,

    sort,
    setSort,

    filteredProducts,
  } = useProducts();

useEffect(() => {
  const searchFromUrl = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "All";
  const sortFromUrl = searchParams.get("sort") || "Newest";

  setSearch(searchFromUrl);
  setCategory(categoryFromUrl);
  setSort(sortFromUrl);
}, [searchParams, setSearch, setCategory, setSort]);


  const handleSearchChange = (value: string) => {
  setSearch(value);

  const params = new URLSearchParams(searchParams.toString());
  const keyword = value.trim();

  if (keyword) {
    params.set("search", keyword);
  } else {
    params.delete("search");
  }

  // เปลี่ยน Search = กลับหน้า 1
  params.delete("page");

  const query = params.toString();

  router.replace(
    query ? `/products?${query}` : "/products",
    { scroll: false }
  );
};

const handleCategoryChange = (value: string) => {
  setCategory(value);

  const params = new URLSearchParams(searchParams.toString());

  if (value === "All") {
    params.delete("category");
  } else {
    params.set("category", value);
  }

  params.delete("page");
  const query = params.toString();

  router.replace(
    query ? `/products?${query}` : "/products",
    { scroll: false }
  );
};

const handleSortChange = (value: string) => {
  setSort(value);

  const params = new URLSearchParams(searchParams.toString());

  if (value === "Newest") {
  params.delete("sort");
} else {
  params.set("sort", value);
}

params.delete("page");

const query = params.toString();

  router.replace(
    query ? `/products?${query}` : "/products",
    { scroll: false }
  );
};


const handleClearFilters = () => {
  setSearch("");
  setCategory("All");
  setSort("Newest");

  router.replace("/products", {
    scroll: false,
  });
};


const totalPages = Math.ceil(
  filteredProducts.length / productsPerPage
);

useEffect(() => {
  if (totalPages === 0 || page <= totalPages) return;

  const params = new URLSearchParams(searchParams.toString());

  if (totalPages <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(totalPages));
  }

  const query = params.toString();

  router.replace(
    query ? `/products?${query}` : "/products",
    { scroll: false }
  );
}, [page, totalPages, router, searchParams]);

const startIndex = (page - 1) * productsPerPage;

const paginatedProducts = filteredProducts.slice(
  startIndex,
  startIndex + productsPerPage
);

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages) return;

  const params = new URLSearchParams(searchParams.toString());

  if (newPage === 1) {
    params.delete("page");
  } else {
    params.set("page", String(newPage));
  }

  const query = params.toString();

  router.replace(
    query ? `/products?${query}` : "/products",
    { scroll: false }
  );
};

  return (
    <>
      <Header />

      <main className="bg-slate-50 text-slate-900 min-h-screen">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">

          <h1 className="mb-6 text-3xl font-bold sm:mb-10 sm:text-5xl">

            สินค้า

          </h1>

          <ProductToolbar
            search={search}
            setSearch={handleSearchChange}
            sort={sort}
            setSort={handleSortChange}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">

            <ProductFilter
              category={category}
              setCategory={handleCategoryChange}
            />

            <div className="min-w-0 lg:col-span-3">
  {filteredProducts.length > 0 ? (
  <>
    <ProductGrid products={paginatedProducts} />

    {totalPages > 1 && (
      <div className="mt-10 flex items-center justify-center gap-2">

        <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 px-4 py-2 transition hover:border-rose-500 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              className={`h-10 min-w-10 rounded-lg border px-3 transition ${
                page === pageNumber
                  ? "border-rose-500 bg-rose-600 text-white"
                  : "border-slate-300 hover:border-rose-500 hover:text-rose-700"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-300 px-4 py-2 transition hover:border-rose-500 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>

      </div>
    )}
  </>
) : (
    <div className="min-h-[420px] flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-5">🔍</div>

        <h2 className="text-2xl font-bold mb-3">
          ไม่พบสินค้า
        </h2>

        <p className="text-slate-600 mb-6">
          ไม่พบสินค้าที่ตรงกับการค้นหาหรือตัวกรองของคุณ
        </p>

        <button
          type="button"
          onClick={handleClearFilters}
          className="rounded-lg bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </div>
  )}
</div>

            </div>

          </div>

      </main>

      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 text-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
            <p className="text-slate-600">กำลังโหลดสินค้า…</p>
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
