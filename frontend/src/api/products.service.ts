import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('products');
  return response.data;
}