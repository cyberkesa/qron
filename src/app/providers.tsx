"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export function Providers({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

// Также добавляем дефолтный экспорт для дополнительной совместимости
export default Providers;
