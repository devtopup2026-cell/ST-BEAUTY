import type {ShippingMethod,ShippingEstimate} from '@/types/shipping';
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CustomerState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  paymentMethod: string;
  shippingMethod: ShippingMethod;
  normalAccess: boolean;
  shippingEstimate: ShippingEstimate | null;

  setCustomer: (data: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    postalCode: string;
    paymentMethod: string;
  shippingMethod: ShippingMethod;
  normalAccess: boolean;
  shippingEstimate: ShippingEstimate | null;
  }) => void;

  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      postalCode: "",
      paymentMethod: "PromptPay",
      shippingMethod: "local",
      normalAccess: false,
      shippingEstimate: null,

      setCustomer: (data) =>
        set({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          postalCode: data.postalCode,
          paymentMethod: data.paymentMethod,
          shippingMethod: data.shippingMethod,
          normalAccess: data.normalAccess,
          shippingEstimate: data.shippingEstimate,
        }),

      clearCustomer: () =>
        set({
          fullName: "",
          phone: "",
          email: "",
          address: "",
          postalCode: "",
          paymentMethod: "PromptPay",
      shippingMethod: "local",
      normalAccess: false,
      shippingEstimate: null,
        }),
    }),
    {
      name: "stvbeauty-customer",
    }
  )
);
