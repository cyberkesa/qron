import { client } from "@/lib/apollo-client";
import { useEffect, useRef } from "react";

/**
 * Хук для предотвращения конфликтов кэширования между RSC и Apollo Client.
 *
 * Проблема: React Server Components (RSC) и Apollo Client имеют разные слои
 * кэширования, которые могут конфликтовать друг с другом, особенно при
 * обновлении данных.
 *
 * Решение:
 * 1. Отслеживаем URL-изменения и очищаем кэш при смене маршрута
 * 2. Позволяем выборочно очищать кэш для определенных запросов
 *
 * @param options Опции конфигурации хука
 * @returns Функция для ручной очистки кэша
 */
export function usePreventCacheConflicts(
  options: {
    // Список операций Apollo, кэш которых нужно сбросить при перемещении между
    // страницами
    operationNames?: string[];
    // Сбросить все хранилище Apollo при изменении URL (по умолчанию - false)
    resetStoreOnURLChange?: boolean;
    // Функция для определения, должен ли произойти сброс кэша (получает текущий и
    // новый URL)
    shouldResetCache?: (currentPath: string, newPath: string) => boolean;
  } = {},
) {
  const {
    operationNames = [],
    resetStoreOnURLChange = false,
    shouldResetCache,
  } = options;

  const lastPathRef = useRef<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  // Отслеживаем изменения URL и сбрасываем кэш при необходимости
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;

      // Проверяем, нужно ли сбрасывать кэш
      const shouldReset = shouldResetCache
        ? shouldResetCache(lastPathRef.current, currentPath)
        : resetStoreOnURLChange;

      // Если путь изменился и нужно сбросить кэш
      if (currentPath !== lastPathRef.current && shouldReset) {
        if (operationNames.length > 0) {
          // Сбрасываем кэш только для указанных операций
          operationNames.forEach((name) => {
            client.cache.evict({ fieldName: name });
          });
          client.cache.gc();
        } else if (resetStoreOnURLChange) {
          // Сбрасываем весь кэш
          client.resetStore().catch((err) => {
            console.error("Error resetting Apollo cache:", err);
          });
        }
      }

      lastPathRef.current = currentPath;
    };

    // Используем MutationObserver для отслеживания изменений URL в Next.js
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== lastPathRef.current) {
        handleRouteChange();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Обработка события popstate (кнопки назад/вперед)
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [operationNames, resetStoreOnURLChange, shouldResetCache]);

  // Возвращаем функцию для ручной очистки кэша
  return {
    clearCache: (operationName?: string) => {
      if (operationName) {
        client.cache.evict({ fieldName: operationName });
        client.cache.gc();
      } else {
        client.resetStore().catch((err) => {
          console.error("Error resetting Apollo cache:", err);
        });
      }
    },
  };
}

export default usePreventCacheConflicts;
