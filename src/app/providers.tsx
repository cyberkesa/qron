"use client";

import { ReactNode, useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";
import { CartProvider } from "@/lib/providers/CartProvider";
import { PerformanceProvider } from "@/lib/providers/PerformanceProvider";
import { ErrorProvider } from "@/lib/providers/ErrorProvider";
import { CacheProvider } from "@/lib/providers/CacheProvider";
import PerformanceDashboard from "@/components/debug/PerformanceDashboard";
import NetworkMonitor from "@/components/debug/NetworkMonitor";

export function Providers({ children }: { children: ReactNode }) {
  // Only include performance monitoring in development mode
  const isDev = process.env.NODE_ENV === "development";

  // Устанавливаем регион по умолчанию, если он не установлен
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Проверяем, выбран ли регион
      const hasRegion = localStorage.getItem("selectedRegion");

      // Если регион не выбран, устанавливаем Москву по умолчанию
      if (!hasRegion) {
        const defaultRegion = { id: "1", name: "Москва" };
        localStorage.setItem("selectedRegion", JSON.stringify(defaultRegion));
        localStorage.setItem("tokenRegionId", "1");
      }

      // Очищаем кэш клиента при загрузке страницы для предотвращения конфликтов RSC и Apollo
      client.resetStore().catch((err) => {
        console.error("Error resetting Apollo cache:", err);
      });
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <ErrorProvider>
        <PerformanceProvider initialEnabled={isDev}>
          <NotificationProvider>
            <CacheProvider resetOnRouteChange={true}>
              <CartProvider>
                {children}
                {/* Only show performance tools in development */}
                {isDev && (
                  <>
                    <PerformanceDashboard />
                    <NetworkMonitor enabled={true} slowThreshold={500} />
                  </>
                )}
              </CartProvider>
            </CacheProvider>
          </NotificationProvider>
        </PerformanceProvider>
      </ErrorProvider>
    </ApolloProvider>
  );
}

// Также добавляем дефолтный экспорт для дополнительной совместимости
export default Providers;
