"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { client, resetApolloCache } from "@/lib/apollo-client";
import usePreventCacheConflicts from "@/lib/hooks/usePreventCacheConflicts";

// Создаем интерфейс для контекста кэширования
interface CacheContextType {
  // Сбросить весь кэш Apollo
  resetCache: () => Promise<void>;
  // Очистить кэш для конкретного запроса
  clearQueryCache: (operationName: string) => void;
  // Принудительно обновить кэш и перерендерить страницу
  refreshPage: () => void;
  // Информация о последней ошибке кэша
  lastCacheError: Error | null;
  // Информация о попытках сброса кэша
  cacheResetAttempts: number;
}

// Создаем контекст с дефолтными значениями
const CacheContext = createContext<CacheContextType>({
  resetCache: async () => {},
  clearQueryCache: () => {},
  refreshPage: () => {},
  lastCacheError: null,
  cacheResetAttempts: 0,
});

// Хук для использования контекста кэширования в компонентах
export const useCacheContext = () => useContext(CacheContext);

interface CacheProviderProps {
  children: ReactNode;
  resetOnRouteChange?: boolean;
}

/**
 * Провайдер для управления кэшированием в клиентских компонентах
 */
export const CacheProvider: React.FC<CacheProviderProps> = ({
  children,
  resetOnRouteChange = false,
}) => {
  const router = useRouter();
  const [lastCacheError, setLastCacheError] = useState<Error | null>(null);
  const [cacheResetAttempts, setCacheResetAttempts] = useState<number>(0);

  // Используем хук для предотвращения конфликтов кэширования
  usePreventCacheConflicts({
    resetStoreOnURLChange: resetOnRouteChange,
    // Дополнительная логика для определения, когда сбрасывать кэш
    shouldResetCache: (oldPath, newPath) => {
      // Не сбрасываем кэш при переходе к страницам, которые точно используют тот же запрос
      // Например, при переходе между похожими страницами каталога
      if (oldPath.startsWith("/catalog/") && newPath.startsWith("/catalog/")) {
        return false;
      }
      return resetOnRouteChange;
    },
  });

  // Функция для очистки кэша
  const resetCache = useCallback(async () => {
    // Инкрементируем счетчик попыток сброса кэша
    setCacheResetAttempts((prev) => prev + 1);

    try {
      // Используем улучшенную функцию сброса кэша из apollo-client.ts
      await resetApolloCache();

      // Сбрасываем ошибку после успешного сброса кэша
      if (lastCacheError) {
        setLastCacheError(null);
      }

      // Сохраняем информацию о последнем успешном сбросе кэша
      if (typeof window !== "undefined") {
        localStorage.setItem("last_cache_reset", new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to reset Apollo cache:", error);

      // Сохраняем информацию об ошибке
      setLastCacheError(error as Error);

      // Если несколько попыток сброса кэша не удались, предлагаем более радикальное решение
      if (cacheResetAttempts >= 3) {
        console.warn(
          "Multiple cache reset failures detected, attempting more aggressive solution...",
        );

        if (typeof window !== "undefined") {
          // Пробуем очистить весь localStorage (это более радикальный подход)
          try {
            localStorage.clear();
            console.log("Successfully cleared localStorage");
          } catch (e) {
            console.error("Failed to clear localStorage:", e);
          }

          // Записываем информацию о радикальном сбросе
          localStorage.setItem("cache_hard_reset", "true");
        }
      }

      // Пробуем самый простой вариант - прямой сброс объекта кэша
      try {
        client.cache.reset();
        console.log("Successfully reset cache using direct cache.reset()");
      } catch (innerError) {
        console.error("Failed even with direct cache reset:", innerError);
      }
    }
  }, [lastCacheError, cacheResetAttempts]);

  // Функция для очистки кэша конкретного запроса
  const clearQueryCache = useCallback(
    (operationName: string) => {
      try {
        client.cache.evict({ fieldName: operationName });
        client.cache.gc();
      } catch (error) {
        console.error(`Failed to clear cache for ${operationName}:`, error);

        // При ошибке попробуем полностью сбросить кэш
        resetCache().catch((e) => {
          console.error("Failed to reset cache after query clear failure:", e);
        });
      }
    },
    [resetCache],
  );

  // Функция для обновления страницы и кэша
  const refreshPage = useCallback(() => {
    resetCache()
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        // Если не удалось сбросить кэш, все равно обновляем страницу
        router.refresh();
      });
  }, [resetCache, router]);

  // Предоставляем контекст
  const contextValue: CacheContextType = {
    resetCache,
    clearQueryCache,
    refreshPage,
    lastCacheError,
    cacheResetAttempts,
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheProvider;
