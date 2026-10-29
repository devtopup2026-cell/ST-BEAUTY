export default function BrandSection() {

  const brands = [
    "ชื่อแบรนด์สินค้า",
    "MSI",
    "GIGABYTE",
    "AMD",
    "INTEL",
    "CORSAIR",
    "KINGSTON",
    "SAMSUNG",
  ];

  return (
    <section className="bg-slate-50 text-slate-900 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          TOP BRANDS
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {brands.map((brand) => (

            <div
              key={brand}
              className="bg-white p-8 rounded-xl text-center font-bold text-xl hover:border hover:border-rose-500 transition"
            >
              {brand}
            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
