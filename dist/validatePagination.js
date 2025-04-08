import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { gql } = require("@apollo/client");
import { parse, visit } from "graphql";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Константы для валидации
const MAX_PAGE_SIZE = 100;
const REQUIRED_CONNECTION_SELECTIONS = ["edges", "pageInfo"];
const REQUIRED_EDGE_SELECTIONS = ["node", "cursor"];
const REQUIRED_PAGE_INFO_SELECTIONS = ["hasNextPage", "endCursor"];
// Load schema
const schemaPath = path.join(__dirname, "../../schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
// Import queries
const queriesPath = path.join(__dirname, "../lib/queries.ts");
const queriesContent = fs.readFileSync(queriesPath, "utf-8");
// Extract queries from the content
const queryRegex = /gql`([\s\S]*?)`/g;
const queries = [];
let match;
while ((match = queryRegex.exec(queriesContent)) !== null) {
  const queryContent = match[1];
  const queryNameMatch = queryContent.match(/(?:query|mutation)\s+(\w+)/);
  if (queryNameMatch) {
    queries.push({ name: queryNameMatch[1], query: queryContent });
  }
}
// Получаем тип поля из схемы
function getFieldType(typeName, fieldName) {
  const type = schema.data.__schema.types.find((t) => t.name === typeName);
  if (!type || !type.fields) return null;
  const field = type.fields.find((f) => f.name === fieldName);
  if (!field) return null;
  // Получаем конечный тип, пропуская NON_NULL и LIST
  let fieldType = field.type;
  while (fieldType.ofType) {
    fieldType = fieldType.ofType;
  }
  return fieldType;
}
// Проверяем, является ли тип connection-типом
function isConnectionType(typeName) {
  return Boolean(
    typeName === null || typeName === void 0
      ? void 0
      : typeName.endsWith("Connection"),
  );
}
// Получаем значение аргумента
function getArgumentValue(arg) {
  const value = arg.value;
  if (value.kind === "IntValue") {
    return parseInt(value.value, 10);
  }
  return null;
}
// Проверяем наличие и валидность выбранных полей
function validateSelectionSet(selectionSet, requiredFields) {
  const errors = [];
  if (!selectionSet) {
    errors.push(
      `Missing selection set. Required fields: ${requiredFields.join(", ")}`,
    );
    return errors;
  }
  const selectedFields = new Set(
    selectionSet.selections
      .filter((s) => s.kind === "Field")
      .map((s) => s.name.value),
  );
  for (const field of requiredFields) {
    if (!selectedFields.has(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  return errors;
}
// Проверяем параметры пагинации
function validatePaginationArgs(args, fieldName) {
  const errors = [];
  if (!args || args.length === 0) {
    errors.push(
      `Field "${fieldName}" requires pagination parameters (first/last)`,
    );
    return errors;
  }
  const hasFirst = args.some((arg) => arg.name.value === "first");
  const hasLast = args.some((arg) => arg.name.value === "last");
  const hasAfter = args.some((arg) => arg.name.value === "after");
  const hasBefore = args.some((arg) => arg.name.value === "before");
  // Проверяем наличие first или last
  if (!hasFirst && !hasLast) {
    errors.push(
      `Field "${fieldName}" requires either 'first' or 'last' parameter`,
    );
  }
  // Проверяем, что first и last не используются вместе
  if (hasFirst && hasLast) {
    errors.push(
      `Field "${fieldName}" cannot have both 'first' and 'last' parameters`,
    );
  }
  // Проверяем корректность использования курсоров
  if (hasFirst && hasBefore) {
    errors.push(`Field "${fieldName}" cannot use 'before' with 'first'`);
  }
  if (hasLast && hasAfter) {
    errors.push(`Field "${fieldName}" cannot use 'after' with 'last'`);
  }
  // Проверяем максимальный размер страницы
  const firstArg = args.find((arg) => arg.name.value === "first");
  const lastArg = args.find((arg) => arg.name.value === "last");
  if (firstArg) {
    const value = getArgumentValue(firstArg);
    if (value !== null && value > MAX_PAGE_SIZE) {
      errors.push(
        `Field "${fieldName}" 'first' value (${value}) exceeds maximum allowed size (${MAX_PAGE_SIZE})`,
      );
    }
  }
  if (lastArg) {
    const value = getArgumentValue(lastArg);
    if (value !== null && value > MAX_PAGE_SIZE) {
      errors.push(
        `Field "${fieldName}" 'last' value (${value}) exceeds maximum allowed size (${MAX_PAGE_SIZE})`,
      );
    }
  }
  return errors;
}
// Функция для проверки запроса
function validateQuery(query) {
  const errors = [];
  try {
    const ast = parse(query);
    visit(ast, {
      Field(node, _key, parent) {
        var _a, _b, _c;
        if (!parent || Array.isArray(parent) || !("kind" in parent)) return;
        // Получаем тип родительского поля
        let parentType = "Query";
        if (parent.kind === "Field") {
          const ancestors =
            (_a = parent.loc) === null || _a === void 0
              ? void 0
              : _a.startToken.prev;
          if (ancestors) {
            const type = getFieldType(parentType, parent.name.value);
            if (type === null || type === void 0 ? void 0 : type.name) {
              parentType = type.name;
            }
          }
        }
        // Получаем тип текущего поля
        const fieldType = getFieldType(parentType, node.name.value);
        if (fieldType && isConnectionType(fieldType.name)) {
          // Проверяем параметры пагинации
          const paginationErrors = validatePaginationArgs(
            node.arguments,
            node.name.value,
          );
          errors.push(...paginationErrors);
          // Проверяем наличие обязательных полей в connection
          const connectionErrors = validateSelectionSet(
            node.selectionSet,
            REQUIRED_CONNECTION_SELECTIONS,
          );
          if (connectionErrors.length > 0) {
            errors.push(
              `Field "${node.name.value}": ${connectionErrors.join(", ")}`,
            );
          }
          // Проверяем поля в edges
          const edgesField =
            (_b = node.selectionSet) === null || _b === void 0
              ? void 0
              : _b.selections.find(
                  (s) => s.kind === "Field" && s.name.value === "edges",
                );
          if (edgesField && "selectionSet" in edgesField) {
            const edgeErrors = validateSelectionSet(
              edgesField.selectionSet,
              REQUIRED_EDGE_SELECTIONS,
            );
            if (edgeErrors.length > 0) {
              errors.push(
                `Field "${node.name.value}.edges": ${edgeErrors.join(", ")}`,
              );
            }
          }
          // Проверяем поля в pageInfo
          const pageInfoField =
            (_c = node.selectionSet) === null || _c === void 0
              ? void 0
              : _c.selections.find(
                  (s) => s.kind === "Field" && s.name.value === "pageInfo",
                );
          if (pageInfoField && "selectionSet" in pageInfoField) {
            const pageInfoErrors = validateSelectionSet(
              pageInfoField.selectionSet,
              REQUIRED_PAGE_INFO_SELECTIONS,
            );
            if (pageInfoErrors.length > 0) {
              errors.push(
                `Field "${node.name.value}.pageInfo": ${pageInfoErrors.join(", ")}`,
              );
            }
          }
        }
      },
    });
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    return { isValid: false, errors: [error.message] };
  }
}
console.log("Запуск проверки пагинации...");
console.log("Проверка запросов:");
let hasErrors = false;
for (const { name, query } of queries) {
  console.log("--------------------------------");
  console.log(`Запрос: ${name}`);
  const { isValid, errors } = validateQuery(query);
  if (isValid) {
    console.log("Статус: ✅ Валидный");
  } else {
    hasErrors = true;
    console.log("Статус: ❌ Ошибка:");
    errors.forEach((error) => console.log(`  - ${error}`));
  }
}
console.log("--------------------------------");
console.log(
  `Общий результат: ${
    hasErrors
      ? "❌ Обнаружены ошибки в пагинации"
      : "✅ Все запросы используют правильную пагинацию"
  }`,
);
