import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./client-layout";
import { AccessibilitySettings } from "@/components/ui/AccessibilitySettings";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "КронМаркет - Интернет-магазин товаров для дома и ремонта",
  description:
    "Широкий ассортимент качественных товаров для дома, ремонта, сада и огорода с доставкой по всей России",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          src="https://api-maps.yandex.ru/2.1/?apikey=0a1aee5c-636b-4e86-8a79-fcaece99de92&lang=ru_RU"
          type="text/javascript"
        />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <AccessibilitySettings />
        <ScrollToTop />
      </body>
    </html>
  );
}
