/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: [
      'files.tovari-kron.ru',
      'backend.qron.ru',
      'api.qron.ru',
      'images.qron.ru',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Улучшение производительности и совместимости с Vercel
  experimental: {
    serverMinification: true,
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lodash'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
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
    // Remove the problematic optimization setting
    // config.optimization.usedExports = true;

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
