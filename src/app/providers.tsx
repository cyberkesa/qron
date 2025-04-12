"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { NotificationProvider } from "@/lib/providers/NotificationProvider";
import { CartProvider } from "@/lib/providers/CartProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <NotificationProvider>
        <CartProvider>{children}</CartProvider>
      </NotificationProvider>
    </ApolloProvider>
  );
}

// Также добавляем дефолтный экспорт для дополнительной совместимости
export default Providers;
