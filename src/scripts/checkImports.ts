import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ImportError {
  file: string;
  line: number;
  importPath: string;
  error: string;
}

interface ImportResult {
  valid: boolean;
  errors: ImportError[];
}

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
  "tailwind-merge", // Добавлен пакет tailwind-merge
  "rxjs",
];

const NODE_BUILT_IN_MODULES = ["fs", "path", "url", "module", "process"];

async function checkImportPath(
  filePath: string,
  importPath: string,
): Promise<boolean> {
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
    const importFullPath = path.resolve(srcPath, importPath.replace("@/", ""));

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
}

async function checkFileImports(filePath: string): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const importRegex = /^import\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/;

  for (const [index, line] of lines.entries()) {
    const match = line.match(importRegex);
    if (match) {
      const importPath = match[1];
      const isValid = await checkImportPath(filePath, importPath);
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
}

async function checkProjectImports(): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const files = glob.sync("src/**/*.{ts,tsx}");

  for (const file of files) {
    const fileErrors = await checkFileImports(file);
    errors.push(...fileErrors);
  }

  return { valid: errors.length === 0, errors };
}

async function main() {
  console.log("🔍 Проверка импортов в проекте...\n");

  const result = await checkProjectImports();

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
}

main();