import Image from "next/image";
import Link from "next/link";
import { Cart as CartType, CartItem } from "@/types/api";
import { useMutation, useApolloClient } from "@apollo/client";
import {
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
  GET_CART,
} from "@/lib/queries";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface CartProps {
  cart: CartType;
}

export function Cart({ cart }: CartProps) {
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [animatedItems, setAnimatedItems] = useState<Record<string, boolean>>(
    {}
  );
  const client = useApolloClient();

  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    onError: (error) => {
      console.error("Error removing from cart:", error);
    },
    update(cache, { data }) {
      try {
        const cachedCart = cache.readQuery({ query: GET_CART });
        if (cachedCart && data?.removeFromCart?.cart) {
          cache.writeQuery({
            query: GET_CART,
            data: { cart: data.removeFromCart.cart },
          });
        }
      } catch (e) {
        console.error("Error updating cache:", e);
      }
    },
  });

  const [updateQuantity] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
    onError: (error) => {
      console.error("Error updating quantity:", error);
    },
    update(cache, { data }) {
      try {
        const cachedCart = cache.readQuery({ query: GET_CART });
        if (cachedCart && data?.updateCartItemQuantity?.cart) {
          cache.writeQuery({
            query: GET_CART,
            data: { cart: data.updateCartItemQuantity.cart },
          });
        }
      } catch (e) {
        console.error("Error updating cache:", e);
      }
    },
  });

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [cartItemId]: true }));
      await removeFromCart({
        variables: {
          cartItemId,
        },
      });

      await client.refetchQueries({
        include: ["GetCart"],
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setLoadingItems((prev) => ({ ...prev, [cartItemId]: true }));

      // Добавляем анимацию
      setAnimatedItems((prev) => ({ ...prev, [cartItemId]: true }));

      await updateQuantity({
        variables: {
          cartItemId,
          quantity,
        },
      });

      await client.refetchQueries({
        include: ["GetCart"],
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [cartItemId]: false }));

      // Убираем анимацию через секунду
      setTimeout(() => {
        setAnimatedItems((prev) => ({ ...prev, [cartItemId]: false }));
      }, 1000);
    }
  };

  const cartItems = cart.items.edges.map((edge) => edge.node);
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Корзина пуста
        </h2>
        <p className="text-gray-600 mb-6">
          Добавьте товары в корзину, чтобы сделать заказ
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
        >
          Перейти к каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
        <p className="text-gray-600 mt-1">Товаров в корзине: {totalItems}</p>
      </div>

      {/* Заголовок таблицы товаров */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b font-medium text-gray-700">
        <div className="col-span-6">Товар</div>
        <div className="col-span-2 text-center">Цена</div>
        <div className="col-span-2 text-center">Количество</div>
        <div className="col-span-2 text-end">Сумма</div>
      </div>

      <div className="divide-y">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className={`grid md:grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-all duration-300 ${
              animatedItems[item.id] ? "bg-blue-50" : ""
            }`}
          >
            {/* Изображение и информация о товаре */}
            <div className="md:col-span-6 flex space-x-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <Link href={`/product/${item.product.slug}`}>
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-contain rounded-md border border-gray-200"
                  />
                </Link>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                  {item.product.category && item.product.category.title}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={loadingItems[item.id]}
                  className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  {loadingItems[item.id] ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-1"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>Удалить</span>
                </button>
              </div>
            </div>

            {/* Цена */}
            <div className="md:col-span-2 flex md:justify-center items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Цена:
              </div>
              <div className="font-medium">
                {new Intl.NumberFormat("ru-RU").format(item.product.price)} ₽
              </div>
            </div>

            {/* Количество */}
            <div className="md:col-span-2 flex md:justify-center items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Кол-во:
              </div>
              <div className="flex items-center border rounded-md overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  disabled={loadingItems[item.id] || item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
                  aria-label="Уменьшить количество"
                >
                  <MinusIcon className="h-3 w-3" />
                </button>
                <div className="w-10 text-center font-medium">
                  {loadingItems[item.id] ? (
                    <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full mx-auto"></div>
                  ) : (
                    <span
                      className={animatedItems[item.id] ? "text-blue-600" : ""}
                    >
                      {item.quantity}
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                  disabled={loadingItems[item.id]}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
                  aria-label="Увеличить количество"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Итоговая цена */}
            <div className="md:col-span-2 flex md:justify-end items-center">
              <div className="md:hidden text-sm font-medium text-gray-500 mr-2">
                Сумма:
              </div>
              <div
                className={`font-bold text-lg ${
                  animatedItems[item.id] ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {new Intl.NumberFormat("ru-RU").format(
                  item.product.price * item.quantity
                )}{" "}
                ₽
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 border-t">
        <div className="flex justify-between items-center mb-8">
          <div className="text-gray-600 text-lg">Итого к оплате:</div>
          <div className="text-2xl font-bold text-blue-600">
            {cart.items.decimalTotalPrice} ₽
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-center flex items-center justify-center"
          >
            <span>Продолжить покупки</span>
          </Link>
          <Link
            href="/checkout"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center"
          >
            <span>Оформить заказ</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
