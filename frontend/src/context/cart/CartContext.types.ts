import { Product, CartItem } from '@/types/product'; 

export interface CartContextType {
  cart: CartItem[]; // Ahora coincidirá perfectamente
  addToCart: (product: Product) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  toggleCart: () => void;
}