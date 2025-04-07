import {ADD_TO_CART, GET_CART, GET_VIEWER, REMOVE_FROM_CART, UPDATE_CART_ITEM_QUANTITY} from '@/lib/queries';
import {Cart, CartItem, CartItemEdge, Product} from '@/types/api';
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';

import {useNotifications} from './useNotifications';

// Ключ для хранения гостевой корзины в localStorage
const GUEST_CART_KEY = 'kron_guest_cart';

interface GuestCartItem {
  product: Product;
  quantity: number;
}

// Типы для объединенного интерфейса корзины
export interface CartItemUnified {
  id: string;
  product: Product;
  quantity: number;
}

export interface CartUnified {
  items: CartItemUnified[];
  totalPrice: number;
  totalItems: number;
  isEmpty: boolean;
}

interface UseCartResult {
  cart: CartUnified;
  isLoading: boolean;
  error: Error|null;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Преобразует количество в соответствии с кратностью товара
 * @param quantity Текущее количество
 * @param multiplicity Кратность товара
 * @returns Скорректированное количество
 */
export function adjustQuantityByMultiplicity(
    quantity: number, multiplicity: number = 1): number {
  // Убеждаемся, что количество кратно шагу
  const adjustedQuantity = Math.round(quantity / multiplicity) * multiplicity;
  // Проверяем, что количество не меньше минимального
  return Math.max(adjustedQuantity, multiplicity);
}

/**
 * Хук для работы с корзиной (гостевой или авторизованной)
 */
export function useCart(): UseCartResult {
  // Состояние гостевой корзины
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>(() => {
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

  // Проверка авторизации пользователя
  const {data: userData} = useQuery(GET_VIEWER);
  const isAuthenticated = !!userData?.viewer;

  // Интеграция с системой уведомлений
  const {showSuccess, showError} = useNotifications();

  // Загрузка корзины для авторизованного пользователя
  const {data: cartData, loading: cartLoading, error: cartError} =
      useQuery(GET_CART, {
        skip: !isAuthenticated,
        fetchPolicy: 'cache-and-network',
      });

  // Apollo клиент для прямого доступа к кэшу
  const client = useApolloClient();

  // Мутации для работы с корзиной на сервере
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [updateCartItemQuantityMutation] =
      useMutation(UPDATE_CART_ITEM_QUANTITY);
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART);

  // Сохранение гостевой корзины в localStorage
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  }, [guestCart, isAuthenticated]);

  // Функция для преобразования данных корзины с сервера в унифицированный
  // формат
  const transformCartData =
      useCallback((serverCart: Cart|null): CartUnified => {
        if (!serverCart || !serverCart.items?.edges) {
          return {items: [], totalPrice: 0, totalItems: 0, isEmpty: true};
        }

        const items = serverCart.items.edges.map(edge => ({
                                                   id: edge.node.id,
                                                   product: edge.node.product,
                                                   quantity: edge.node.quantity
                                                 }));

        const totalItems =
            items.reduce((total, item) => total + item.quantity, 0);
        const totalPrice =
            parseFloat(serverCart.items.decimalTotalPrice || '0');

        return {items, totalPrice, totalItems, isEmpty: items.length === 0};
      }, []);

  // Преобразование гостевой корзины в унифицированный формат
  const transformGuestCart = useCallback((): CartUnified => {
    const items = guestCart.map(item => ({
                                  id: item.product.id,
                                  product: item.product,
                                  quantity: item.quantity
                                }));

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce(
        (total, item) => total + (item.product.price * item.quantity), 0);

    return {items, totalPrice, totalItems, isEmpty: items.length === 0};
  }, [guestCart]);

  // Получение унифицированной корзины в зависимости от авторизации
  const unifiedCart = isAuthenticated ?
      transformCartData(cartData?.cart || null) :
      transformGuestCart();

  // Добавление товара в корзину
  const addToCart =
      async(product: Product, quantity: number): Promise<void> => {
    // Получаем шаг товара (по умолчанию 1)
    const step = product.quantityMultiplicity || 1;
    // Корректируем количество с учетом кратности
    const adjustedQuantity = adjustQuantityByMultiplicity(quantity, step);

    try {
      if (isAuthenticated) {
        // Для авторизованного пользователя используем мутацию
        const result = await addToCartMutation({
          variables: {productId: product.id, quantity: adjustedQuantity},
          update(cache, {data}) {
            if (data?.updateCartItemQuantity?.cart) {
              cache.writeQuery({
                query: GET_CART,
                data: {cart: data.updateCartItemQuantity.cart},
              });
            }
          }
        });

        // Обновляем кэш
        await client.refetchQueries({
          include: ['GetCart'],
        });
      } else {
        // Для гостя обновляем локальное состояние
        setGuestCart(prevCart => {
          const existingItem =
              prevCart.find(item => item.product.id === product.id);

          if (existingItem) {
            // Если товар уже в корзине, обновляем количество
            const newQuantity = adjustQuantityByMultiplicity(
                existingItem.quantity + adjustedQuantity, step);

            return prevCart.map(
                item => item.product.id === product.id ?
                    {...item, quantity: newQuantity} :
                    item);
          }

          // Добавляем новый товар
          return [
            ...prevCart, {product, quantity: Math.max(adjustedQuantity, step)}
          ];
        });
      }

      // Показываем уведомление об успешном добавлении
      showSuccess(`${product.name} добавлен в корзину`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Показываем уведомление об ошибке
      showError(`Не удалось добавить ${product.name} в корзину`);
      throw error;
    }
  };

  // Обновление количества товара в корзине
  const updateQuantity =
      async(productId: string, quantity: number): Promise<void> => {
    try {
      if (isAuthenticated) {
        // Для авторизованного пользователя
        const cartItem =
            cartData?.cart?.items?.edges
                .find(
                    (edge: CartItemEdge) => edge.node.product.id === productId)
                ?.node;

        if (!cartItem) return;

        // Получаем шаг товара (по умолчанию 1)
        const step = cartItem.product.quantityMultiplicity || 1;
        // Корректируем количество с учетом кратности
        const adjustedQuantity = adjustQuantityByMultiplicity(quantity, step);

        // Если количество не изменилось, не делаем запрос
        if (adjustedQuantity === cartItem.quantity) return;

        await updateCartItemQuantityMutation({
          variables: {productId, quantity: adjustedQuantity},
          update(cache, {data}) {
            if (data?.updateCartItemQuantity?.cart) {
              cache.writeQuery({
                query: GET_CART,
                data: {cart: data.updateCartItemQuantity.cart},
              });
            }
          }
        });

        // Показываем уведомление об обновлении количества
        showSuccess(`Количество товара изменено`);
      } else {
        // Для гостя
        setGuestCart(prevCart => {
          const item = prevCart.find(item => item.product.id === productId);
          if (!item) return prevCart;

          // Получаем шаг товара (по умолчанию 1)
          const step = item.product.quantityMultiplicity || 1;
          // Корректируем количество с учетом кратности
          const adjustedQuantity = adjustQuantityByMultiplicity(quantity, step);

          // Если количество не изменилось, не обновляем
          if (adjustedQuantity === item.quantity) return prevCart;

          // Показываем уведомление об обновлении количества
          showSuccess(`Количество товара изменено`);

          return prevCart.map(
              item => item.product.id === productId ?
                  {...item, quantity: adjustedQuantity} :
                  item);
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError('Не удалось изменить количество товара');
      throw error;
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async(productId: string): Promise<void> => {
    try {
      // Находим товар для уведомления
      let productName = 'Товар';
      if (isAuthenticated) {
        const cartItem =
            cartData?.cart?.items?.edges
                .find(
                    (edge: CartItemEdge) => edge.node.product.id === productId)
                ?.node;
        if (cartItem) {
          productName = cartItem.product.name;
        }
      } else {
        const cartItem = guestCart.find(item => item.product.id === productId);
        if (cartItem) {
          productName = cartItem.product.name;
        }
      }

      if (isAuthenticated) {
        // Для авторизованного пользователя
        await removeFromCartMutation({
          variables: {productId},
          update(cache, {data}) {
            if (data?.updateCartItemQuantity?.cart) {
              cache.writeQuery({
                query: GET_CART,
                data: {cart: data.updateCartItemQuantity.cart},
              });
            }
          }
        });

        // Обновляем кэш
        await client.refetchQueries({
          include: ['GetCart'],
        });
      } else {
        // Для гостя
        setGuestCart(
            prevCart => prevCart.filter(item => item.product.id !== productId));
      }

      // Показываем уведомление об удалении товара
      showSuccess(`${productName} удален из корзины`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      showError('Не удалось удалить товар из корзины');
      throw error;
    }
  };

  // Очистка корзины
  const clearCart = async(): Promise<void> => {
    if (isAuthenticated) {
      try {
        // Для авторизованного пользователя поочередно удаляем все товары
        const edges = cartData?.cart?.items?.edges || [];

        // Используем Promise.all для параллельной обработки
        await Promise.all(edges.map(
            (edge: CartItemEdge) => removeFromCartMutation(
                {variables: {productId: edge.node.product.id}})));

        // Обновляем кэш
        await client.refetchQueries({
          include: ['GetCart'],
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    } else {
      // Для гостя
      setGuestCart([]);
    }
  };

  // Синхронизация гостевой корзины с серверной при авторизации
  useEffect(() => {
    const syncGuestCartToServer = async () => {
      // Если пользователь авторизовался и у нас есть товары в гостевой корзине
      if (isAuthenticated && guestCart.length > 0 && !cartLoading) {
        try {
          // Добавляем каждый товар из гостевой корзины на сервер
          for (const item of guestCart) {
            await addToCartMutation({
              variables: {productId: item.product.id, quantity: item.quantity}
            });
          }

          // Очищаем гостевую корзину
          setGuestCart([]);
          localStorage.removeItem(GUEST_CART_KEY);

          // Обновляем корзину с сервера
          await client.refetchQueries({
            include: ['GetCart'],
          });
        } catch (error) {
          console.error('Error syncing guest cart to server:', error);
        }
      }
    };

    syncGuestCartToServer();
  }, [isAuthenticated, cartLoading]);

  return {
    cart: unifiedCart,
    isLoading: isAuthenticated ? cartLoading : false,
    error: cartError || null,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isAuthenticated
  };
}