var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NEXT_BUILT_IN_MODULES = [
  "next/image",
  "next/link",
  "next/navigation",
  "next/font/google",
  "next/router",
];
const NODE_MODULES = [
  "@apollo/client",
  "@heroicons/react/24/outline",
  "@heroicons/react/24/solid",
  "@headlessui/react",
  "react",
  "react-dom",
  "clsx",
  "graphql",
];
const NODE_BUILT_IN_MODULES = ["fs", "path", "url", "module", "process"];
function checkImportPath(filePath, importPath) {
  return __awaiter(this, void 0, void 0, function* () {
    // Проверяем встроенные модули Node.js
    if (NODE_BUILT_IN_MODULES.includes(importPath)) {
      return true;
    }
    // Проверяем встроенные модули Next.js
    if (NEXT_BUILT_IN_MODULES.includes(importPath)) {
      return true;
    }
    // Проверяем известные node_modules
    if (
      NODE_MODULES.includes(importPath) ||
      NODE_MODULES.some((module) => importPath.startsWith(`${module}/`))
    ) {
      return true;
    }
    // Проверяем абсолютные импорты (начинающиеся с @/)
    if (importPath.startsWith("@/")) {
      const projectRoot = path.resolve(__dirname, "../..");
      const srcPath = path.join(projectRoot, "src");
      const importFullPath = path.resolve(
        srcPath,
        importPath.replace("@/", ""),
      );
      // Проверяем существование файла с разными расширениями
      const extensions = [".ts", ".tsx", ".js", ".jsx"];
      for (const ext of extensions) {
        if (fs.existsSync(importFullPath + ext)) {
          return true;
        }
      }
      // Проверяем существование индексного файла в директории
      for (const ext of extensions) {
        if (fs.existsSync(path.join(importFullPath, `index${ext}`))) {
          return true;
        }
      }
      return false;
    }
    // Проверяем относительные импорты
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const fileDir = path.dirname(filePath);
      const importFullPath = path.resolve(fileDir, importPath);
      // Проверяем существование файла с разными расширениями
      const extensions = [".ts", ".tsx", ".js", ".jsx"];
      for (const ext of extensions) {
        if (fs.existsSync(importFullPath + ext)) {
          return true;
        }
      }
      // Проверяем существование индексного файла в директории
      for (const ext of extensions) {
        if (fs.existsSync(path.join(importFullPath, `index${ext}`))) {
          return true;
        }
      }
      return false;
    }
    return false;
  });
}
function checkFileImports(filePath) {
  return __awaiter(this, void 0, void 0, function* () {
    const errors = [];
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const importRegex = /^import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/;
    for (const [index, line] of lines.entries()) {
      const match = line.match(importRegex);
      if (match) {
        const importPath = match[1];
        const isValid = yield checkImportPath(filePath, importPath);
        if (!isValid) {
          errors.push({
            file: filePath,
            line: index + 1,
            importPath,
            error: `Не найден файл или модуль: ${importPath}`,
          });
        }
      }
    }
    return errors;
  });
}
function checkProjectImports() {
  return __awaiter(this, void 0, void 0, function* () {
    const errors = [];
    const files = glob.sync("src/**/*.{ts,tsx}");
    for (const file of files) {
      const fileErrors = yield checkFileImports(file);
      errors.push(...fileErrors);
    }
    return { valid: errors.length === 0, errors };
  });
}
function main() {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("🔍 Проверка импортов в проекте...\n");
    const result = yield checkProjectImports();
    if (result.valid) {
      console.log("✅ Все импорты корректны!");
    } else {
      console.log("❌ Найдены ошибки в импортах:");
      result.errors.forEach((error) => {
        console.log(`\nФайл: ${error.file}`);
        console.log(`Строка: ${error.line}`);
        console.log(`Импорт: ${error.importPath}`);
        console.log(`Ошибка: ${error.error}`);
      });
      process.exit(1);
    }
  });
}
main();
