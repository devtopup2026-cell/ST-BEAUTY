import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  addItem: (product: Product) => void;

  removeItem: (id: number) => void;

  increase: (id: number) => void;

  decrease: (id: number) => void;

  clear: () => void;

  totalItems: () => number;

  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;

        const exist = items.find(
          (i) => i.product.id === product.id
        );

if (exist) {
  if (exist.quantity >= product.stock) {
    return;
  }

  set({
    items: items.map((i) =>
      i.product.id === product.id
        ? {
            ...i,
            quantity: i.quantity + 1,
          }
        : i
    ),
  });

  return;
}

if (product.stock <= 0) {
  return;
}


        set({
          items: [
            ...items,
            {
              product,
              quantity: 1,
            },
          ],
        });
      },

      removeItem: (id) =>
        set({
          items: get().items.filter(
            (i) => i.product.id !== id
          ),
        }),

increase: (id) =>
  set({
    items: get().items.map((i) => {
      if (i.product.id !== id) {
        return i;
      }

      if (i.quantity >= i.product.stock) {
        return i;
      }

      return {
        ...i,
        quantity: i.quantity + 1,
      };
    }),
  }),

      decrease: (id) =>
        set({
          items: get().items
            .map((i) =>
              i.product.id === id
                ? {
                    ...i,
                    quantity: i.quantity - 1,
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        }),

      clear: () =>
        set({
          items: [],
        }),

      totalItems: () =>
        get().items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            item.product.price * item.quantity,
          0
        ),
    }),
    {
      name: "stvbeauty-cart",
    }
  )
);
