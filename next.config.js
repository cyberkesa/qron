/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["files.tovari-kron.ru"],
    unoptimized: true,
  },
  typescript: {
    // Отключаем проверку типов
    ignoreBuildErrors: true,
  },
  eslint: {
    // Отключаем проверку линтера
    ignoreDuringBuilds: true,
  },
  // Отключаем строгий режим
  reactStrictMode: false,
  // Упрощенная конфигурация без проблемных опций
  poweredByHeader: false,
  swcMinify: true,
};

module.exports = nextConfig;
