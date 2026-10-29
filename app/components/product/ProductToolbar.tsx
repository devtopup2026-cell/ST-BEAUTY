"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;

  sort: string;
  setSort: (value: string) => void;
};

export default function ProductToolbar({
  search,
  setSearch,
  sort,
  setSort,
}: Props) {
  return (
    <div className="mb-8 flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:justify-between lg:gap-5">

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="ค้นหาสินค้า" placeholder="ค้นหาสินค้าที่คุณชอบ…"
        className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-rose-500 sm:px-5 lg:w-96"
      />

    <select aria-label="เรียงสินค้า"
  value={sort}
  onChange={(e) => setSort(e.target.value)}
  className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-rose-500 sm:px-5 lg:w-auto"
>
  <option value="Newest">ใหม่ล่าสุด</option>

  <option value="PriceLow">
    ราคา ต่ำ → สูง
  </option>

  <option value="PriceHigh">
    ราคา สูง → ต่ำ
  </option>

  <option value="Name">
    A-Z
  </option>
      </select>

    </div>
  );
}
