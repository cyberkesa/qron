import React from "react";
import type { AppProps } from "next/app";

// Базовый компонент приложения для Pages Router с TypeScript
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
