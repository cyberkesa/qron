import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Константы для валидации
const MAX_PAGE_SIZE = 100;
// Паттерны для поиска использования пагинации в компонентах
const PAGINATION_PATTERNS = [
  {
    // Поиск переменных в useQuery
    pattern:
      /useQuery\(\s*[A-Z_]+\s*,\s*\{\s*variables\s*:\s*\{[\s\S]*?first\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "first",
  },
  {
    // Поиск переменных в useLazyQuery
    pattern:
      /useLazyQuery\(\s*[A-Z_]+\s*,\s*\{\s*variables\s*:\s*\{[\s\S]*?first\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "first",
  },
  {
    // Поиск переменных в fetchMore
    pattern: /fetchMore\(\s*\{\s*variables\s*:\s*\{[\s\S]*?first\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "first",
  },
  {
    // Поиск переменных в useQuery для last
    pattern:
      /useQuery\(\s*[A-Z_]+\s*,\s*\{\s*variables\s*:\s*\{[\s\S]*?last\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "last",
  },
  {
    // Поиск переменных в useLazyQuery для last
    pattern:
      /useLazyQuery\(\s*[A-Z_]+\s*,\s*\{\s*variables\s*:\s*\{[\s\S]*?last\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "last",
  },
  {
    // Поиск переменных в fetchMore для last
    pattern: /fetchMore\(\s*\{\s*variables\s*:\s*\{[\s\S]*?last\s*:\s*(\d+)/g,
    extractValue: (match) => parseInt(match[1], 10),
    paramName: "last",
  },
];
// Функция для получения всех файлов компонентов
function getComponentFiles() {
  const basePath = path.join(__dirname, "..");
  // Ищем все файлы .tsx в каталогах /app и /components
  const appFiles = glob.sync("app/**/*.tsx", { cwd: basePath });
  const componentFiles = glob.sync("components/**/*.tsx", { cwd: basePath });
  return [...appFiles, ...componentFiles].map((file) =>
    path.join(basePath, file),
  );
}
// Функция для проверки компонента
function validateComponentFile(filePath) {
  const errors = [];
  const fileName = path.relative(path.join(__dirname, ".."), filePath);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Проверка каждого паттерна
    for (const { pattern, extractValue, paramName } of PAGINATION_PATTERNS) {
      let match;
      pattern.lastIndex = 0; // Сбрасываем индекс регулярного выражения
      while ((match = pattern.exec(content)) !== null) {
        const value = extractValue(match);
        if (value > MAX_PAGE_SIZE) {
          const lines = content.slice(0, match.index).split("\n");
          const lineNumber = lines.length;
          errors.push(
            `File "${fileName}" line ${lineNumber}: ${paramName} value (${value}) exceeds maximum allowed size (${MAX_PAGE_SIZE})`,
          );
        }
      }
    }
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Error reading file "${fileName}": ${error.message}`],
    };
  }
}
// Главная функция
function validateComponentsPagination() {
  console.log("Запуск проверки использования пагинации в компонентах...");
  const componentFiles = getComponentFiles();
  console.log(`Найдено ${componentFiles.length} файлов для проверки.`);
  let hasErrors = false;
  let validCount = 0;
  let errorCount = 0;
  for (const filePath of componentFiles) {
    const { isValid, errors } = validateComponentFile(filePath);
    if (!isValid) {
      hasErrors = true;
      errorCount++;
      const fileName = path.relative(path.join(__dirname, ".."), filePath);
      console.log(`\n❌ Ошибки в файле: ${fileName}`);
      errors.forEach((error) => console.log(`  - ${error}`));
    } else {
      validCount++;
    }
  }
  console.log("\n--------------------------------");
  console.log(`Проверено файлов: ${componentFiles.length}`);
  console.log(`✅ Валидных файлов: ${validCount}`);
  console.log(`❌ Файлов с ошибками: ${errorCount}`);
  console.log(
    `Общий результат: ${
      hasErrors
        ? "❌ Обнаружены ошибки в использовании пагинации"
        : "✅ Все компоненты используют правильную пагинацию"
    }`,
  );
}
// Запуск проверки
validateComponentsPagination();
