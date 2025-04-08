import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["files.tovari-kron.ru"],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
  // Улучшение производительности и совместимости с Vercel
  experimental: {
    serverMinification: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
