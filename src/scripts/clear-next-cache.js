#!/usr/bin/env node

/**
 * Скрипт для очистки кэша Next.js
 *
 * Запуск: node src/scripts/clear-next-cache.js
 *
 * Этот скрипт удаляет кэши Next.js, что может помочь в решении проблем с кэшированием,
 * включая ошибки в framework.js и другие проблемы связанные с кэшем.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Получаем корневую директорию проекта
const rootDir = path.resolve(__dirname, "../../");

// Пути к различным типам кэша
const cachePaths = [
  path.join(rootDir, ".next/cache"),
  path.join(rootDir, "node_modules/.cache"),
];

// Если есть кэш для server actions
const serverActionsCache = path.join(rootDir, ".next/server/app/actions.js");
if (fs.existsSync(serverActionsCache)) {
  cachePaths.push(serverActionsCache);
}

// Специфичные файлы framework.js и другие, которые могут вызывать проблемы
const specificFiles = [
  path.join(rootDir, ".next/server/framework.js"),
  path.join(rootDir, ".next/server/webpack-runtime.js"),
  path.join(rootDir, ".next/server/app-paths-manifest.json"),
  path.join(rootDir, ".next/cache/.rscinfo"),
];

// Удаляем специфичные файлы
specificFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Удален файл: ${file}`);
    } catch (err) {
      console.error(`❌ Ошибка при удалении файла ${file}:`, err);
    }
  } else {
    console.log(`ℹ️ Файл не существует: ${file}`);
  }
});

// Удаляем директории кэша
cachePaths.forEach((cachePath) => {
  if (fs.existsSync(cachePath)) {
    try {
      // Для директорий используем fs.rmSync с опцией recursive
      if (fs.statSync(cachePath).isDirectory()) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        // Пересоздаем пустую директорию кэша
        fs.mkdirSync(cachePath, { recursive: true });
        console.log(`✅ Очищена директория кэша: ${cachePath}`);
      } else {
        fs.unlinkSync(cachePath);
        console.log(`✅ Удален файл кэша: ${cachePath}`);
      }
    } catch (err) {
      console.error(`❌ Ошибка при очистке кэша ${cachePath}:`, err);
    }
  } else {
    console.log(`ℹ️ Путь не существует: ${cachePath}`);
  }
});

// Дополнительные действия для очистки
console.log("🔄 Запускаем дополнительные действия для очистки...");

try {
  // Очищаем все node_modules/.cache
  execSync("find node_modules/.cache -type d -exec rm -rf {} +", {
    stdio: "inherit",
    cwd: rootDir,
  });
  console.log("✅ Очищен кэш в node_modules/.cache");
} catch (err) {
  console.error("❌ Ошибка при очистке node_modules/.cache:", err.message);
}

// Финальное сообщение
console.log("\n✨ Кэш Next.js успешно очищен!");
console.log("🚀 Теперь запустите `npm run dev` для свежего старта приложения.");
