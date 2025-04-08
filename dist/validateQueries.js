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
import { Kind, parse } from "graphql";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Цвета для консоли
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
};
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
// Функция для получения типа поля из схемы
function getTypeFromSchema(typeName) {
  return schema.data.__schema.types.find((t) => t.name === typeName);
}
// Функция для получения типа поля
function getFieldType(field) {
  if (!field || !field.type) return null;
  if (field.type.kind === "NON_NULL") {
    return getFieldType({ type: field.type.ofType });
  }
  if (field.type.kind === "LIST") {
    return getFieldType({ type: field.type.ofType });
  }
  return field.type;
}
// Функция для проверки enum значений
function validateEnumValue(enumType, value) {
  return enumType.enumValues.some((v) => v.name === value);
}
// Функция для проверки существования поля в типе
function validateField(typeName, fieldName, path, context) {
  const type = getTypeFromSchema(typeName);
  if (!type) {
    context.errors.push(
      `Тип ${typeName} не найден в схеме (путь: ${path.join(".")})`,
    );
    return false;
  }
  // Проверяем дубликаты полей
  const fieldPath = path.concat(fieldName).join(".");
  if (context.seenFields.has(fieldPath)) {
    context.warnings.push(
      `Дубликат поля ${fieldName} найден в пути ${fieldPath}`,
    );
  }
  context.seenFields.add(fieldPath);
  // Для интерфейсов и объектов проверяем поля
  if (type.fields) {
    const field = type.fields.find((f) => f.name === fieldName);
    if (!field) {
      context.errors.push(
        `Поле ${fieldName} не найдено в типе ${typeName} (путь: ${path.join(".")})`,
      );
      return false;
    }
    // Проверяем deprecated поля
    if (field.isDeprecated) {
      context.warnings.push(
        `Поле ${fieldName} помечено как устаревшее (путь: ${path.join(".")}). Причина: ${field.deprecationReason || "не указана"}`,
      );
    }
    return true;
  }
  // Для других типов (скаляры, перечисления) просто проверяем их существование
  return true;
}
// Функция для проверки фрагмента
function validateFragment(fragment, context) {
  const typeName = fragment.typeCondition.name.value;
  return validateSelectionSet(
    fragment.selectionSet,
    typeName,
    [fragment.name.value],
    context,
  );
}
// Функция для рекурсивной проверки полей
function validateSelectionSet(selectionSet, typeName, path, context) {
  var _a, _b;
  if (!selectionSet || !selectionSet.selections) return true;
  let isValid = true;
  const type = getTypeFromSchema(typeName);
  if (!type) {
    context.errors.push(
      `Тип ${typeName} не найден в схеме (путь: ${path.join(".")})`,
    );
    return false;
  }
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const fieldName = selection.name.value;
      const currentPath = [...path, fieldName];
      // Пропускаем служебные поля
      if (fieldName === "__typename") continue;
      // Проверяем существование поля
      if (!validateField(typeName, fieldName, currentPath, context)) {
        isValid = false;
        continue;
      }
      // Проверяем аргументы поля
      if (selection.arguments && selection.arguments.length > 0) {
        const field =
          (_a = type.fields) === null || _a === void 0
            ? void 0
            : _a.find((f) => f.name === fieldName);
        if (field && field.args) {
          for (const arg of selection.arguments) {
            const argDef = field.args.find((a) => a.name === arg.name.value);
            if (!argDef) {
              context.errors.push(
                `Неизвестный аргумент ${arg.name.value} для поля ${fieldName} (путь: ${currentPath.join(".")})`,
              );
              isValid = false;
            } else if (
              arg.value.kind === Kind.ENUM &&
              argDef.type.kind === "ENUM"
            ) {
              const enumType = getTypeFromSchema(argDef.type.name);
              if (!validateEnumValue(enumType, arg.value.value)) {
                context.errors.push(
                  `Неверное значение enum ${arg.value.value} для аргумента ${arg.name.value} (путь: ${currentPath.join(".")})`,
                );
                isValid = false;
              }
            }
          }
        }
      }
      // Если у поля есть вложенные поля, проверяем их
      if (selection.selectionSet) {
        const field =
          (_b = type.fields) === null || _b === void 0
            ? void 0
            : _b.find((f) => f.name === fieldName);
        if (!field) continue;
        const fieldType = getFieldType(field);
        if (!fieldType) continue;
        isValid =
          validateSelectionSet(
            selection.selectionSet,
            fieldType.name,
            currentPath,
            context,
          ) && isValid;
      }
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = context.fragments.get(selection.name.value);
      if (!fragment) {
        context.errors.push(
          `Фрагмент ${selection.name.value} не найден (путь: ${path.join(".")})`,
        );
        isValid = false;
      } else {
        isValid = validateFragment(fragment, context) && isValid;
      }
    } else if (
      selection.kind === Kind.INLINE_FRAGMENT &&
      selection.typeCondition
    ) {
      const fragmentTypeName = selection.typeCondition.name.value;
      isValid =
        validateSelectionSet(
          selection.selectionSet,
          fragmentTypeName,
          path,
          context,
        ) && isValid;
    }
  }
  return isValid;
}
// Функция для проверки типа переменной
function validateVariableType(variableType, schemaType) {
  if (!variableType || !schemaType) return false;
  if (variableType.kind === "NonNullType" && schemaType.kind === "NON_NULL") {
    return validateVariableType(variableType.type, schemaType.ofType);
  }
  if (variableType.kind === "ListType" && schemaType.kind === "LIST") {
    return validateVariableType(variableType.type, schemaType.ofType);
  }
  if (
    variableType.kind === "NamedType" &&
    (schemaType.kind === "SCALAR" ||
      schemaType.kind === "INPUT_OBJECT" ||
      schemaType.kind === "ENUM")
  ) {
    return variableType.name.value === schemaType.name;
  }
  return false;
}
// Функция для проверки запроса
function validateQuery(queryString) {
  try {
    const ast = parse(queryString);
    const context = {
      seenFields: new Set(),
      fragments: new Map(),
      errors: [],
      warnings: [],
    };
    // Сначала собираем все фрагменты
    for (const definition of ast.definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        context.fragments.set(definition.name.value, definition);
      }
    }
    // Затем проверяем все операции
    for (const definition of ast.definitions) {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        const operationType = definition.operation;
        let rootType = "";
        switch (operationType) {
          case "query":
            rootType = "Query";
            break;
          case "mutation":
            rootType = "Mutation";
            break;
          case "subscription":
            rootType = "Subscription";
            break;
          default:
            context.errors.push(`Неизвестный тип операции: ${operationType}`);
            continue;
        }
        if (definition.selectionSet) {
          validateSelectionSet(definition.selectionSet, rootType, [], context);
        }
      } else if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        validateFragment(definition, context);
      }
    }
    return {
      isValid: context.errors.length === 0,
      errors: context.errors,
      warnings: context.warnings,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Ошибка парсинга запроса: ${error}`],
      warnings: [],
    };
  }
}
// Функция для поиска GraphQL файлов
function findGraphQLFiles() {
  return __awaiter(this, void 0, void 0, function* () {
    return glob.glob("src/**/*.{ts,tsx}");
  });
}
// Основная функция для валидации всех запросов
function validateQueries() {
  return __awaiter(this, void 0, void 0, function* () {
    const files = yield findGraphQLFiles();
    let hasErrors = false;
    let totalQueries = 0;
    let validQueries = 0;
    console.log(colors.cyan("\nНачинаю валидацию GraphQL запросов...\n"));
    for (const file of files) {
      const content = yield fs.promises.readFile(file, "utf8");
      const matches = content.match(queryRegex);
      if (!matches) continue;
      for (const match of matches) {
        totalQueries++;
        const queryString = match.replace(/^gql`/, "").replace(/`$/, "");
        const result = validateQuery(queryString);
        if (result.isValid) {
          validQueries++;
          console.log(
            `${colors.green("✓")} ${colors.gray(file)}: ${colors.green("Валидный запрос")}`,
          );
        } else {
          hasErrors = true;
          console.log(
            `${colors.red("✗")} ${colors.gray(file)}: ${colors.red("Ошибки в запросе")}`,
          );
          for (const error of result.errors) {
            console.log(`  ${colors.red("•")} ${error}`);
          }
        }
        if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            console.log(`  ${colors.yellow("!")} ${warning}`);
          }
        }
      }
    }
    console.log(
      `\n${colors.cyan("Итоги валидации:")} ${validQueries}/${totalQueries} запросов валидны\n`,
    );
    return !hasErrors;
  });
}
