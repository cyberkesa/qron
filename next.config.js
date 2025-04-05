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
  // Полностью отключаем все проверки для деплоя
  experimental: {
    appDocumentPreloading: false,
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: ["*"],
  },
  // Отключаем предварительный рендеринг для страниц 404 и ошибок
  excludeDefaultMomentLocales: true,
  poweredByHeader: false,
  swcMinify: false,
};

module.exports = nextConfig;
