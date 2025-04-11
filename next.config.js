import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Получаем __dirname аналог для ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import bundle analyzer
import withBundleAnalyzer from "@next/bundle-analyzer";

// Асинхронная функция для загрузки конфигурации
async function loadConfig() {
  // Conditionally import Sentry
  let withSentryConfig;
  try {
    ({ withSentryConfig } = await import("@sentry/nextjs"));
  } catch (e) {
    withSentryConfig = (config) => config;
    console.warn("@sentry/nextjs not found, error reporting disabled");
  }

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        "backend.qron.ru",
        "api.qron.ru",
        "images.qron.ru",
        "files.tovari-kron.ru",
      ],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
          port: "",
          pathname: "/**",
        },
      ],
    },
    poweredByHeader: false,
    compress: true,
  };

  // Sentry configuration
  const sentryWebpackPluginOptions = {
    silent: true,
  };

  // Apply all wrappers
  const configWithBundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
    openAnalyzer: true,
  })(nextConfig);

  return process.env.NODE_ENV === "production" &&
    typeof withSentryConfig === "function"
    ? withSentryConfig(configWithBundleAnalyzer, sentryWebpackPluginOptions)
    : configWithBundleAnalyzer;
}

// Загружаем и экспортируем конфиг
export default await loadConfig();
