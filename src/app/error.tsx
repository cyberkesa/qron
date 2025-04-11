"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCacheContext } from "@/lib/providers/CacheProvider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { resetCache } = useCacheContext();

  // Логируем информацию об ошибке
  useEffect(() => {
    console.error("Global error caught:", error);

    // Дополнительное логирование для ошибок Apollo
    if (
      error.name === "ApolloError" ||
      error.message.includes("go.apollo.dev/c/err")
    ) {
      console.error("Apollo error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Если это ошибка Apollo, пытаемся сбросить кэш
      resetCache().catch((err) => {
        console.error("Failed to reset Apollo cache:", err);
      });
    }
  }, [error, resetCache]);

  // Проверяем, является ли ошибка связанной с Apollo и кэшем
  const isApolloError =
    error.name === "ApolloError" ||
    error.message.includes("go.apollo.dev/c/err");

  const handleResetAndClearCache = async () => {
    try {
      // Сначала сбрасываем кэш Apollo
      await resetCache();

      // Если это ошибка Apollo, также сбрасываем локальные данные
      if (isApolloError && typeof window !== "undefined") {
        // Очищаем только связанные с Apollo ключи в localStorage
        const apolloRelatedKeys = [
          "apollo-cache-persist",
          "apollo:queries",
          "apollo_cache_error_count",
          "last_cache_reset",
          "cache_hard_reset",
        ];

        apolloRelatedKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Игнорируем ошибки
          }
        });
      }

      // Затем сбрасываем состояние ошибки
      reset();
    } catch (err) {
      console.error("Error while resetting:", err);

      // Если все методы восстановления не сработали, перезагружаем страницу
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Что-то пошло не так
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isApolloError
              ? "Произошла ошибка при загрузке данных. Возможно, проблема с кэшем приложения."
              : "Произошла непредвиденная ошибка в приложении."}
          </p>
        </div>

        {/* Информация об ошибке (только в режиме разработки) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 bg-red-50 p-4 rounded-md overflow-auto max-h-40">
            <p className="text-red-700 font-medium">Error: {error.message}</p>
            {error.digest && (
              <p className="text-sm text-red-500">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col space-y-4">
          <button
            onClick={handleResetAndClearCache}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isApolloError ? "Сбросить кэш и повторить" : "Попробовать снова"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Вернуться на главную
          </button>

          {isApolloError && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Если проблема повторяется, попробуйте{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== "undefined") {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                очистить данные приложения
              </a>{" "}
              или перезагрузить страницу.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
