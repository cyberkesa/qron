import crypto from "crypto";
// Import bundle analyzer
import withBundleAnalyzer from "@next/bundle-analyzer";

// Create bundle analyzer wrapper
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["backend.qron.ru", "api.qron.ru", "images.qron.ru"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
    // Optimize image performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
  },
  // Improve build output
  output: "standalone",
  // Enable optimizations
  swcMinify: true,
  // Configure module optimization
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
    browsersListForSwc: true,
    // Experimental features that improve performance
    serverComponentsExternalPackages: ["sharp", "ioredis"],
    modularizeImports: {
      "@heroicons/react/24/outline": {
        transform: "@heroicons/react/24/outline/{{member}}",
      },
      "@heroicons/react/24/solid": {
        transform: "@heroicons/react/24/solid/{{member}}",
      },
    },
  },
  // Configure webpack for better chunk splitting and performance
  webpack: (config, { dev, isServer }) => {
    // Only apply these optimizations for production builds
    if (!dev) {
      // Optimize chunk splitting
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|next|@apollo\/client)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context
                ? module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
                : null;
              return match ? `npm.${match[1].replace("@", "")}` : "npm.unknown";
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: (module, chunks) => {
              return crypto
                .createHash("md5")
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ""))
                .digest("hex")
                .substring(0, 8);
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Server-specific optimizations
    if (isServer) {
      // Handle packages that should be bundled only on client
      config.externals = [...config.externals, "react", "react-dom"];
    }

    return config;
  },
  // Configure bundle analyzer for production builds when needed
  // Uncomment to analyze your bundle
  // analyzeServer: process.env.ANALYZE === 'true',
  // analyzeBrowser: process.env.ANALYZE === 'true',
  // bundleAnalyzerConfig: {
  //   server: {
  //     analyzerMode: 'static',
  //     reportFilename: '../analyze/server.html',
  //   },
  //   browser: {
  //     analyzerMode: 'static',
  //     reportFilename: '../analyze/client.html',
  //   },
  // },
};

// Export the wrapped config
export default bundleAnalyzer(nextConfig);
