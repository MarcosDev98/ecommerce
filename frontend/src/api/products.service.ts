import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
}

export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('products');
  return response.data;
}

export const createProduct = async (productData: CreateProduct) => {
  const response = await api.post('/products', productData);
  return response.data;
}