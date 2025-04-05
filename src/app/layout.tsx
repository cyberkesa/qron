import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
