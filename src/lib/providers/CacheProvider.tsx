"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { client } from "@/lib/apollo-client";
import usePreventCacheConflicts from "@/lib/hooks/usePreventCacheConflicts";

// Создаем интерфейс для контекста кэширования
interface CacheContextType {
  // Сбросить весь кэш Apollo
  resetCache: () => Promise<void>;
  // Очистить кэш для конкретного запроса
  clearQueryCache: (operationName: string) => void;
  // Принудительно обновить кэш и перерендерить страницу
  refreshPage: () => void;
}

// Создаем контекст с дефолтными значениями
const CacheContext = createContext<CacheContextType>({
  resetCache: async () => {},
  clearQueryCache: () => {},
  refreshPage: () => {},
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
    try {
      await client.resetStore();
    } catch (error) {
      console.error("Failed to reset Apollo cache:", error);
    }
  }, []);

  // Функция для очистки кэша конкретного запроса
  const clearQueryCache = useCallback((operationName: string) => {
    client.cache.evict({ fieldName: operationName });
    client.cache.gc();
  }, []);

  // Функция для обновления страницы и кэша
  const refreshPage = useCallback(() => {
    resetCache().then(() => {
      router.refresh();
    });
  }, [resetCache, router]);

  // Предоставляем контекст
  const contextValue: CacheContextType = {
    resetCache,
    clearQueryCache,
    refreshPage,
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheProvider;
