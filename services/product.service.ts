import { products } from "../data/products";
import type { Product } from "../types/product";

export const ProductService = {
  getAll(): Product[] {
    return products;
  },

  getByCategory(category: string): Product[] {
    if (category === "All") return products;

    return products.filter(
      (product) => product.category === category
    );
  },

  search(keyword: string): Product[] {
    const q = keyword.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q)
    );
  },

  getById(id: number) {
    return products.find((product) => product.id === id);
  },

  getBySlug(slug: string) {
  return products.find(
    (product) => product.slug === slug
  );
},
};
