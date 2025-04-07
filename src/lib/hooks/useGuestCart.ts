import {Product} from '@/types/api';
import {useEffect, useState} from 'react';

const GUEST_CART_KEY = 'kron_guest_cart';

interface CartItem {
  product: Product;
  quantity: number;
}

export function useGuestCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Инициализируем состояние из localStorage при создании
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (error) {
          console.error('Error loading guest cart:', error);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
    }
    return [];
  });

  // Синхронизируем localStorage с состоянием корзины
  useEffect(() => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem =
          prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        // Учитываем кратность при добавлении
        const step = product.quantityMultiplicity || 1;
        const newQuantity =
            Math.round((existingItem.quantity + quantity) / step) * step;
        return prevCart.map(
            item => item.product.id === product.id ?
                {...item, quantity: newQuantity} :
                item);
      }
      // При первом добавлении устанавливаем количество равным кратности
      const initialQuantity = product.quantityMultiplicity || 1;
      return [...prevCart, {product, quantity: initialQuantity}];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.product.id === productId);
      if (!item) return prevCart;

      const step = item.product.quantityMultiplicity || 1;
      // Убеждаемся, что количество кратно шагу
      const adjustedQuantity = Math.round(quantity / step) * step;
      // Проверяем, что количество не меньше минимального
      const finalQuantity = Math.max(adjustedQuantity, step);

      return prevCart.map(
          item => item.product.id === productId ?
              {...item, quantity: finalQuantity} :
              item);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce(
        (total, item) => total + (item.product.price * item.quantity), 0);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice
  };
}