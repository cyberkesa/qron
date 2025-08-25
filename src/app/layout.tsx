import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from './client-layout';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import Script from 'next/script';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';
import { Http2Optimizer, Http2Monitor } from '@/components/ui/Http2Optimizer';
import ContrastChecker from '@/components/ui/ContrastChecker';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: 'КРОН – онлайн-магазин товаров для сада и огорода',
  description:
    'Широкий ассортимент качественных товаров для дома, ремонта, сада и огорода с доставкой по всей России',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-theme="light">
      <head>
        {/* Font preloading */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* HTTP/2 optimized preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Critical API connections with HTTP/2 hints */}
        <link
          rel="preconnect"
          href="https://api.tovari-kron.ru"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://files.tovari-kron.ru"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://tovari-kron.ru"
          crossOrigin="anonymous"
        />

        {/* Image domain preconnects for HTTP/2 multiplexing */}
        <link
          rel="preconnect"
          href="https://backend.qron.ru"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://images.qron.ru"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for analytics */}
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Resource hints for better HTTP/2 utilization */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-blue-600 focus:text-white focus:px-3 focus:py-2 focus:rounded"
        >
          Пропустить к контенту
        </a>
        <Http2Optimizer priority={true} />
        <Http2Monitor />
        <ContrastChecker />
        <ClientLayout>
          <div id="main">{children}</div>
        </ClientLayout>
        <ScrollToTop />
        <Script
          src="https://api-maps.yandex.ru/2.1/?apikey=0a1aee5c-636b-4e86-8a79-fcaece99de92&lang=ru_RU"
          strategy="afterInteractive"
        />
        <YandexMetrika />
      </body>
    </html>
  );
}
