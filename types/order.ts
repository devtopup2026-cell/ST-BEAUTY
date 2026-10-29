export interface OrderItem {

  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;

}

export interface Customer {

  fullname: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;

}

export interface Order {

  id: string;

  customer: Customer;

  items: OrderItem[];

  total: number;

  paymentMethod: string;

  paymentSlip?: string;

  status:
    | "Pending Payment"
    | "Paid"
    | "Shipping"
    | "Completed"
    | "Cancelled";

  createdAt: string;

}
