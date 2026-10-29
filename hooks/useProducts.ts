"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "../types/product";

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");

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

      setProducts(data.products);
    } catch (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดสินค้าได้"
      );
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, []);

  const filteredProducts = useMemo(() => {

    let result = [...products];

    // Search
    // Search
const keyword = search.trim().toLowerCase();

if (keyword) {
  result = result.filter((product) => {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    const category = product.category.toLowerCase();
    const sku = product.sku?.toLowerCase() ?? "";

    return (
      name.includes(keyword) ||
      brand.includes(keyword) ||
      category.includes(keyword) ||
      sku.includes(keyword)
    );
  });
}

    // Category
    if (category !== "All") {
      result = result.filter(product => product.category === category);
    }

    // Sort
    switch (sort) {

      case "PriceLow":
        result.sort((a, b) => a.price - b.price);
        break;

      case "PriceHigh":
        result.sort((a, b) => b.price - a.price);
        break;

      case "Name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        break;

    }

    return result;

  }, [products, search, category, sort]);

  return {
    search,
    setSearch,

    category,
    setCategory,

   sort,
   setSort,

   filteredProducts,

   loading,
   error,
  };
}
