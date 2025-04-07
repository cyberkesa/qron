"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  // Для отслеживания посещения страницы 404 в аналитике
  useEffect(() => {
    // Здесь можно добавить код для отправки события в аналитику
    console.log("404 page visited");
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl w-full text-center px-4 error-404">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>

        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8 divider"></div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Страница не найдена
        </h2>

        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Извините, но мы не можем найти запрашиваемую вами страницу. Возможно,
          она была перемещена, удалена или никогда не существовала.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            На главную
          </Link>

          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          Если вы считаете, что это ошибка, пожалуйста,{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            свяжитесь с нами
          </Link>
        </div>
      </div>
    </div>
  );
}
