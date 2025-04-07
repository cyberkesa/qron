import React, { createContext, useContext } from "react";
import { useCart, CartUnified } from "@/lib/hooks/useCart";
import { Product } from "@/types/api";

// Тип контекста корзины
interface CartContextType {
  cart: CartUnified;
  isLoading: boolean;
  error: Error | null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isAuthenticated: boolean;
}

// Создаем контекст для корзины
const CartContext = createContext<CartContextType | null>(null);

// Хук для удобного доступа к контексту корзины
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

// Провайдер контекста корзины
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Используем наш хук для работы с корзиной
  const cartMethods = useCart();

  return (
    <CartContext.Provider value={cartMethods}>{children}</CartContext.Provider>
  );
};
