import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

// Расширенный список встроенных модулей Next.js
const NEXT_BUILT_IN_MODULES = [
  'next/image',
  'next/link',
  'next/navigation',
  'next/font/google',
  'next/router',
  'next/head',
  'next/script',
  'next/dynamic',
  'next/server',
  'next/headers',
  'next/dist/client/app-router',
  'next/cache',
  'next/constants',
];

// Расширенный список node_modules
const NODE_MODULES = [
  '@apollo/client',
  '@apollo/experimental-nextjs-app-support',
  '@heroicons/react/24/outline',
  '@heroicons/react/24/solid',
  '@headlessui/react',
  'react',
  'react-dom',
  'clsx',
  'graphql',
  'tailwind-merge',
  'rxjs',
  'node-fetch',
  'react-input-mask',
  'tslib',
  'tailwindcss',
  'crypto-js',
  'js-cookie',
  'lodash',
  'zod',
  'uuid',
  'react-hook-form',
];

// Расширенный список встроенных модулей Node.js
const NODE_BUILT_IN_MODULES = [
  'fs',
  'path',
  'url',
  'module',
  'process',
  'crypto',
  'http',
  'https',
  'querystring',
  'stream',
  'buffer',
  'util',
  'events',
  'zlib',
  'assert',
  'os',
  'child_process',
];

// Проверяет существует ли файл с любым из указанных расширений
function checkFileExistsWithExtensions(
  basePath: string,
  extensions: string[]
): boolean {
  for (const ext of extensions) {
    if (fs.existsSync(basePath + ext)) {
      return true;
    }
  }

  // Проверяем наличие index файла в директории
  try {
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      for (const ext of extensions) {
        if (fs.existsSync(path.join(basePath, `index${ext}`))) {
          return true;
        }
      }
    }
  } catch (error) {
    // Игнорируем ошибки при проверке директории
  }

  return false;
}

async function checkImportPath(
  filePath: string,
  importPath: string
): Promise<boolean> {
  // Проверяем встроенные модули Node.js
  if (NODE_BUILT_IN_MODULES.includes(importPath)) {
    return true;
  }

  // Проверяем встроенные модули Next.js
  if (
    NEXT_BUILT_IN_MODULES.includes(importPath) ||
    NEXT_BUILT_IN_MODULES.some((module) => importPath.startsWith(`${module}/`))
  ) {
    return true;
  }

  // Проверяем известные node_modules и их подмодули
  if (
    NODE_MODULES.includes(importPath) ||
    NODE_MODULES.some((module) => importPath.startsWith(`${module}/`))
  ) {
    return true;
  }

  // Проверка на все установленные пакеты в node_modules
  try {
    const projectRoot = path.resolve(__dirname, '../..');
    const nodeModulesPath = path.join(projectRoot, 'node_modules', importPath);
    if (fs.existsSync(nodeModulesPath)) {
      return true;
    }
  } catch (error) {
    // Игнорируем ошибки при проверке node_modules
  }

  const extensions = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.css',
    '.scss',
    '.module.css',
    '.module.scss',
  ];

  // Проверяем абсолютные импорты (начинающиеся с @/)
  if (importPath.startsWith('@/')) {
    const projectRoot = path.resolve(__dirname, '../..');
    const srcPath = path.join(projectRoot, 'src');
    const importFullPath = path.resolve(srcPath, importPath.replace('@/', ''));

    return checkFileExistsWithExtensions(importFullPath, extensions);
  }

  // Проверяем относительные импорты
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fileDir = path.dirname(filePath);
    const importFullPath = path.resolve(fileDir, importPath);

    return checkFileExistsWithExtensions(importFullPath, extensions);
  }

  // Если импорт не относительный и не абсолютный, предполагаем, что это node
  // модуль который может быть не в нашем списке, но установлен
  return true;
}

async function checkFileImports(filePath: string): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Улучшенные регулярные выражения для разных типов импортов
  const importRegexes = [
    // Стандартный импорт: import X from 'path'
    /^import\s+(?:{[^}]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/,
    // Импорт типа: import 'path'
    /^import\s+['"]([^'"]+)['"]/,
    // Динамический импорт: const X = import('path')
    /import\(['"]([^'"]+)['"]\)/,
    // Импорт с type: import type { X } from 'path'
    /^import\s+type\s+(?:{[^}]*}|\w+)\s+from\s+['"]([^'"]+)['"]/,
    // require: require('path')
    /require\(['"]([^'"]+)['"]\)/,
  ];

  for (const [lineIndex, line] of lines.entries()) {
    for (const regex of importRegexes) {
      const match = line.match(regex);
      if (match) {
        const importPath = match[1];
        const isValid = await checkImportPath(filePath, importPath);
        if (!isValid) {
          errors.push({
            file: filePath,
            line: lineIndex + 1,
            importPath,
            error: `Не найден файл или модуль: ${importPath}`,
          });
        }
        break; // Если нашли совпадение по одному из шаблонов, прерываем цикл
      }
    }
  }

  return errors;
}

async function checkProjectImports(): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const files = glob.sync('src/**/*.{ts,tsx}');

  console.log(`Найдено ${files.length} файлов для проверки...`);
  let processed = 0;

  for (const file of files) {
    const fileErrors = await checkFileImports(file);
    errors.push(...fileErrors);

    processed++;
    if (processed % 50 === 0 || processed === files.length) {
      console.log(`Обработано ${processed}/${files.length} файлов...`);
    }
  }

  return { valid: errors.length === 0, errors };
}

async function main() {
  console.log('🔍 Проверка импортов в проекте...\n');

  try {
    const result = await checkProjectImports();

    if (result.valid) {
      console.log('✅ Все импорты корректны!');
    } else {
      console.log('\n❌ Найдены ошибки в импортах:');
      result.errors.forEach((error) => {
        console.log(`\nФайл: ${error.file}`);
        console.log(`Строка: ${error.line}`);
        console.log(`Импорт: ${error.importPath}`);
        console.log(`Ошибка: ${error.error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('Произошла ошибка при проверке импортов:', error);
    process.exit(1);
  }
}

main();
