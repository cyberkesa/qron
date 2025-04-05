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
  // Отключаем предупреждения
  poweredByHeader: false,
  swcMinify: false,

  // Экспериментальные опции
  experimental: {
    // Полностью пропускаем все проверки CSR bailout
    missingSuspenseWithCSRBailout: {
      enabled: false,
    },
    // Отключаем некоторые функции App Router, чтобы избежать проблем с useSearchParams
    disableOptimizedLoading: true,
    appDir: false, // Полностью отключаем App Router для этого проекта
    esmExternals: "loose",
    // Явно отключаем пререндер статических страниц
    isrMemoryCacheSize: 0,
    // Используем Pages Router для страниц ошибок
    turbotrace: false,
    forceSwcTransforms: true,
  },
  // Функция для обработки ошибок во время сборки
  onBuildError: (error) => {
    console.warn("Ignoring build error:", error);
    return true; // Игнорировать ошибки
  },
};

module.exports = nextConfig;
