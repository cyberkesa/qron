/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: [
      'files.tovari-kron.ru', // Основной домен для файлов
    ],
  },
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',
  // Улучшение производительности
  experimental: {
    optimizeCss: true,
  },
  poweredByHeader: false,
  compress: true, // Enable gzip compression
  // Cache immutable assets for longer time
  headers: async () => [
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/images/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ],
  webpack: (config, { dev, isServer }) => {
    // Add bundle analyzer in production build when ANALYZE=true
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
  // Добавляем настройки для статической генерации
  staticPageGenerationTimeout: 120, // Увеличиваем таймаут для генерации статических страниц
  generateStaticParams: true, // Включаем генерацию статических параметров
};

export default nextConfig;
