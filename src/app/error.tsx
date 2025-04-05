"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логируем ошибку в консоль в режиме разработки
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Что-то пошло не так
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Произошла ошибка при обработке вашего запроса. Мы уже работаем над её
          устранением.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
