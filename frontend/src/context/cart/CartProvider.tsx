import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types/product';
import { CartContext } from './CartContext';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem?.quantity === 1) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => setCart([]);
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  const toggleCart = () => setIsOpen(!isOpen);
  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, totalItems, totalPrice, isOpen, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
};