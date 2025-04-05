/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  // Базовые настройки
  distDir: "build",
  images: {
    domains: ["files.tovari-kron.ru"],
    unoptimized: true,
  },
  // Отключение всех проверок
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Отключение всех оптимизаций
  optimizeFonts: false,
  poweredByHeader: false,
  generateEtags: false,
  compress: false,
  // Настройки для отключения пререндеринга
  trailingSlash: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  // Игнорирование ошибок сборки
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  // Отключаем опцию useFileSystemPublicRoutes, чтобы использовать собственный роутинг
  useFileSystemPublicRoutes: false,
};
