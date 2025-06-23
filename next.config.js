/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: [
      'files.tovari-kron.ru',
      'backend.qron.ru',
      'api.qron.ru',
      'images.qron.ru',
      'tovari-kron.ru',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // Отключаем оптимизацию изображений для устранения ошибок
  },
  // Улучшение производительности и совместимости с Vercel
  experimental: {
    serverMinification: true,
    optimizeCss: true,
    cssChunking: 'strict',
    optimizePackageImports: [
      '@heroicons/react',
      'lodash',
      '@apollo/client',
      'react-phone-input-2',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Включаем tree shaking для лучшей оптимизации
    esmExternals: true,
  },
  // Таймаут для генерации статических страниц
  staticPageGenerationTimeout: 60,
  poweredByHeader: false,
  compress: true, // Enable gzip compression
  httpAgentOptions: {
    keepAlive: true,
  },
  // Исправляем проблемы с Safari
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
  // Cache immutable assets for longer time
  headers: async () => [
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
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
        {
          key: 'Accept-Ranges',
          value: 'bytes',
        },
      ],
    },
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
    // Специальные заголовки для изображений с внешних доменов
    {
      source: '/api/images/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Cross-Origin-Resource-Policy',
          value: 'cross-origin',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
      ],
    },
  ],
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000, // 244KB chunks
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              maxSize: 244000,
            },
          },
        },
      };
    }

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
};

export default nextConfig;
