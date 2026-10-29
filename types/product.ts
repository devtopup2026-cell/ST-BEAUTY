export interface ProductImage {
  id: number;
  url: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {

  id: number;

  slug: string;

  name: string;

  brand: string;

  category: string;
  unit?: string;

  shortDescription?: string;

  description?: string;

  image: string;

  thumbnail?: string;

  images?: string[];

  price: number;

  compareAtPrice?: number;

  stock: number;

  rating: number;

  reviewCount?: number;

  featured?: boolean;

  isNew: boolean;

  specifications?: {
    label: string;
    value: string;
  }[];

  warranty?: string;

  sku?: string;

}
