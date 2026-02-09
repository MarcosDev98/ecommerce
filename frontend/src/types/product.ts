export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock: number;
  images: ProductImage[];
  createdAt?: string;
}

export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
}

export interface ProductCardProps {
  product: Product;
}