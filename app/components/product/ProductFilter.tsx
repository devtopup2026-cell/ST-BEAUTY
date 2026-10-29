"use client";

import { categories as storeCategories } from '@/lib/store-config';
const categories = ['All', ...storeCategories];

type Props = {
  category: string;
  setCategory: (value: string) => void;
};

export default function ProductFilter({
  category,
  setCategory,
}: Props) {
 return (
  <aside className="min-w-0 rounded-2xl bg-white p-4 sm:p-6">

    <h2 className="mb-4 text-xl font-bold sm:text-2xl lg:mb-6">
      หมวดหมู่สินค้า
    </h2>

    <div
      className="
        flex
        gap-2
        overflow-x-auto
        pb-2
        lg:block
        lg:space-y-3
        lg:overflow-visible
        lg:pb-0
      "
    >
      {categories.map((item) => (
        <button
          key={item === "All" ? "ทั้งหมด" : item}
          type="button"
          onClick={() => setCategory(item)}
          className={`
            shrink-0
            whitespace-nowrap
            rounded-xl
            px-4
            py-3
            text-left
            transition
            lg:w-full

            ${
              category === item
                ? "bg-rose-600 text-white"
                : "bg-slate-100/60 hover:bg-slate-100 lg:bg-transparent"
            }
          `}
        >
          {item === "All" ? "ทั้งหมด" : item}
        </button>
      ))}
    </div>

  </aside>
);
}
