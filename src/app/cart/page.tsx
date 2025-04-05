"use client";

import { useQuery } from "@apollo/client";
import { GET_CART } from "@/lib/queries";
import { Cart } from "@/components/Cart";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CartPage() {
  const { data, loading, error } = useQuery(GET_CART);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка корзины...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Ошибка загрузки корзины
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );

  if (!data?.cart)
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Корзина не найдена
          </h2>
          <p className="text-gray-600 mb-6">
            Возможно, вы не авторизованы или ваша сессия истекла
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/"
              className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Перейти к каталогу
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ваша корзина</h1>
      <Cart cart={data.cart} />
    </main>
  );
}
