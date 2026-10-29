"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";

type OrderStore = {
  orders: Order[];

  addOrder: (order: Order) => void;

  clearOrders: () => void;

  getOrderById: (id: string) => Order | undefined;

  updateOrderStatus: (
    id: string,
    status: Order["status"]
  ) => void;
};

export const useOrderStore = create<OrderStore>()(
persist(


(set, get) => ({

  orders: [],

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),

  clearOrders: () =>
    set({
      orders: [],
    }),

getOrderById: (id) => {
  return get().orders.find((order) => order.id === id);
},

updateOrderStatus: (id, status) =>
  set((state) => ({
    orders: state.orders.map((order) =>
      order.id === id
        ? { ...order, status }
        : order
    ),
  })),



}),


{
  name: "stvbeauty-orders",
}

)
);
