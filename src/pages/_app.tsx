import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Custom404 from "./404";
import "../app/globals.css";

// Базовый компонент приложения для Pages Router с TypeScript
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Эффект для установки готовности приложения
  useEffect(() => {
    setReady(true);
  }, []);

  // Если приложение не готово, показываем загрузку
  if (!ready) {
    return <div>Загрузка...</div>;
  }

  // Перехватываем маршрут _not-found и показываем нашу страницу 404
  if (router.pathname === "/_not-found" || router.pathname === "/404") {
    return <Custom404 />;
  }

  // Рендерим обычный компонент
  return <Component {...pageProps} />;
}
