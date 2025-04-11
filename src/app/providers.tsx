"use client";

import { ReactNode, useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";
import { CartProvider } from "@/lib/providers/CartProvider";
import { PerformanceProvider } from "@/lib/providers/PerformanceProvider";
import { ErrorProvider } from "@/lib/providers/ErrorProvider";
import { CacheProvider } from "@/lib/providers/CacheProvider";

export function Providers({ children }: { children: ReactNode }) {
  // Очистить кэш Apollo при инициализации клиентской части
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Очищаем кэш клиента при загрузке страницы для предотвращения конфликтов RSC и Apollo
      client.resetStore().catch((err) => {
        console.error("Error resetting Apollo cache:", err);
      });
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <ErrorProvider>
        <PerformanceProvider>
          <NotificationProvider>
            <CacheProvider resetOnRouteChange={true}>
              <CartProvider>{children}</CartProvider>
            </CacheProvider>
          </NotificationProvider>
        </PerformanceProvider>
      </ErrorProvider>
    </ApolloProvider>
  );
}

// Также добавляем дефолтный экспорт для дополнительной совместимости
export default Providers;
