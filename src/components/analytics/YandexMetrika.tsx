"use client";

import { useEffect } from "react";
import Script from "next/script";
import Image from "next/image";

// Фиксированный ID счетчика Яндекс.Метрики
const YANDEX_METRIKA_ID = "100995493";

export function YandexMetrika() {
  useEffect(() => {
    // Отправка просмотра страницы при изменении маршрута в SPA
    const handleRouteChange = (url: string) => {
      if (window.ym) {
        window.ym(Number(YANDEX_METRIKA_ID), "hit", url);
      }
    };

    // Добавляем слушатель для Next.js
    document.addEventListener("routeChangeComplete", handleRouteChange as any);

    return () => {
      document.removeEventListener(
        "routeChangeComplete",
        handleRouteChange as any,
      );
    };
  }, []);

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${YANDEX_METRIKA_ID}, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            ecommerce: "dataLayer"
          });
        `}
      </Script>
      <noscript>
        <div>
          <Image
            src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
            alt=""
            width={1}
            height={1}
            style={{ position: "absolute", left: "-9999px" }}
            unoptimized
          />
        </div>
      </noscript>
    </>
  );
}

// Добавляем TypeScript тип для глобального объекта window
declare global {
  interface Window {
    ym: (id: number, action: string, url: string, options?: any) => void;
    dataLayer?: any[];
  }
}
