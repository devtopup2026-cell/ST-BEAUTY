"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
};

export default function ProductGallery({
  images,
}: Props) {

  const [selected, setSelected] = useState(0);

  return (

    <div>

      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">

        <Image
          src={images[selected]}
          alt=""
          fill
          className="object-cover"
        />

      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">

        {images.map((image, index) => (

          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
              selected === index
                ? "border-rose-500"
                : "border-slate-200"
            }`}
          >

            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
            />

          </button>

        ))}

      </div>

    </div>

  );

}
