"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";
import { CartProvider } from "@/lib/providers/CartProvider";
import { PerformanceProvider } from "@/lib/providers/PerformanceProvider";
import { ErrorProvider } from "@/lib/providers/ErrorProvider";
import PerformanceDashboard from "@/components/debug/PerformanceDashboard";
import NetworkMonitor from "@/components/debug/NetworkMonitor";

export function Providers({ children }: { children: ReactNode }) {
  // Only include performance monitoring in development mode
  const isDev = process.env.NODE_ENV === "development";

  return (
    <ApolloProvider client={client}>
      <ErrorProvider>
        <PerformanceProvider initialEnabled={isDev}>
          <NotificationProvider>
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
          </NotificationProvider>
        </PerformanceProvider>
      </ErrorProvider>
    </ApolloProvider>
  );
}

// Также добавляем дефолтный экспорт для дополнительной совместимости
export default Providers;
