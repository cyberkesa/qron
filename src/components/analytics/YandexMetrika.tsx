'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';

// ID счетчика Яндекс.Метрики из окружения
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '';

export function YandexMetrika() {
  useEffect(() => {
    if (!YANDEX_METRIKA_ID) return;
    // Для App Router отслеживаем изменения пути
    try {
      const onPopState = () => {
        if (window.ym) {
          window.ym(
            Number(YANDEX_METRIKA_ID),
            'hit',
            window.location.pathname + window.location.search
          );
        }
      };
      window.addEventListener('popstate', onPopState);
      return () => {
        window.removeEventListener('popstate', onPopState);
      };
    } catch {}
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

          ${YANDEX_METRIKA_ID ? `ym(${YANDEX_METRIKA_ID}, "init", {` : ''}
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            ecommerce: "dataLayer"
          }${YANDEX_METRIKA_ID ? ');' : ''}
        `}
      </Script>
      <noscript>
        <div>
          <Image
            src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
            alt=""
            width={1}
            height={1}
            style={{ position: 'absolute', left: '-9999px' }}
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
