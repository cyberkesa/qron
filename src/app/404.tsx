"use client";

import Link from "next/link";
import { Suspense } from "react";

// Компонент содержимого без useSearchParams
function NotFoundContent() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Страница не найдена
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}

// Обертываем в Suspense для предотвращения ошибки
export default function Custom404() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
