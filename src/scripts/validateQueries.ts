import { gql } from '@apollo/client';
import * as fs from 'fs';
import * as glob from 'glob';
import {
  DocumentNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  parse,
} from 'graphql';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Цвета для консоли
const colors = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
};

interface ValidationContext {
  seenFields: Set<string>;
  fragments: Map<string, FragmentDefinitionNode>;
  errors: string[];
  warnings: string[];
}

// Load schema
const schemaPath = path.join(__dirname, '../../schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Pattern to extract gql contents in scanned files
const queryRegex = /gql`([\s\S]*?)`/g;

// Функция для получения типа поля из схемы
function getTypeFromSchema(typeName: string): any {
  return schema.data.__schema.types.find((t: any) => t.name === typeName);
}

// Функция для получения типа поля
function getFieldType(field: any): any {
  if (!field || !field.type) return null;

  if (field.type.kind === 'NON_NULL') {
    return getFieldType({ type: field.type.ofType });
  }
  if (field.type.kind === 'LIST') {
    return getFieldType({ type: field.type.ofType });
  }
  return field.type;
}

// Функция для проверки enum значений
function validateEnumValue(enumType: any, value: string): boolean {
  return enumType.enumValues.some((v: any) => v.name === value);
}

// Функция для проверки существования поля в типе
function validateField(
  typeName: string,
  fieldName: string,
  path: string[],
  context: ValidationContext
): boolean {
  const type = getTypeFromSchema(typeName);
  if (!type) {
    context.errors.push(
      `Тип ${typeName} не найден в схеме (путь: ${path.join('.')})`
    );
    return false;
  }

  // Проверяем дубликаты полей
  const fieldPath = path.concat(fieldName).join('.');
  if (context.seenFields.has(fieldPath)) {
    context.warnings.push(
      `Дубликат поля ${fieldName} найден в пути ${fieldPath}`
    );
  }
  context.seenFields.add(fieldPath);

  // Для интерфейсов и объектов проверяем поля
  if (type.fields) {
    const field = type.fields.find((f: any) => f.name === fieldName);
    if (!field) {
      context.errors.push(
        `Поле ${fieldName} не найдено в типе ${
          typeName
        } (путь: ${path.join('.')})`
      );
      return false;
    }

    // Проверяем deprecated поля
    if (field.isDeprecated) {
      context.warnings.push(
        `Поле ${fieldName} помечено как устаревшее (путь: ${path.join(
          '.'
        )}). Причина: ${field.deprecationReason || 'не указана'}`
      );
    }

    return true;
  }

  // Для других типов (скаляры, перечисления) просто проверяем их существование
  return true;
}

// Функция для проверки фрагмента
function validateFragment(
  fragment: FragmentDefinitionNode,
  context: ValidationContext
): boolean {
  const typeName = fragment.typeCondition.name.value;
  return validateSelectionSet(
    fragment.selectionSet,
    typeName,
    [fragment.name.value],
    context
  );
}

// Функция для рекурсивной проверки полей
function validateSelectionSet(
  selectionSet: any,
  typeName: string,
  path: string[],
  context: ValidationContext
): boolean {
  if (!selectionSet || !selectionSet.selections) return true;

  let isValid = true;
  const type = getTypeFromSchema(typeName);

  if (!type) {
    context.errors.push(
      `Тип ${typeName} не найден в схеме (путь: ${path.join('.')})`
    );
    return false;
  }

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const fieldName = selection.name.value;
      const currentPath = [...path, fieldName];

      // Пропускаем служебные поля
      if (fieldName === '__typename') continue;

      // Проверяем существование поля
      if (!validateField(typeName, fieldName, currentPath, context)) {
        isValid = false;
        continue;
      }

      // Проверяем аргументы поля
      if (selection.arguments && selection.arguments.length > 0) {
        const field = type.fields?.find((f: any) => f.name === fieldName);
        if (field && field.args) {
          for (const arg of selection.arguments) {
            const argDef = field.args.find(
              (a: any) => a.name === arg.name.value
            );
            if (!argDef) {
              context.errors.push(
                `Неизвестный аргумент ${arg.name.value} для поля ${
                  fieldName
                } (путь: ${currentPath.join('.')})`
              );
              isValid = false;
            } else if (
              arg.value.kind === Kind.ENUM &&
              argDef.type.kind === 'ENUM'
            ) {
              const enumType = getTypeFromSchema(argDef.type.name);
              if (!validateEnumValue(enumType, arg.value.value)) {
                context.errors.push(
                  `Неверное значение enum ${arg.value.value} для аргумента ${
                    arg.name.value
                  } (путь: ${currentPath.join('.')})`
                );
                isValid = false;
              }
            }
          }
        }
      }

      // Если у поля есть вложенные поля, проверяем их
      if (selection.selectionSet) {
        const field = type.fields?.find((f: any) => f.name === fieldName);
        if (!field) continue;

        const fieldType = getFieldType(field);
        if (!fieldType) continue;

        isValid =
          validateSelectionSet(
            selection.selectionSet,
            fieldType.name,
            currentPath,
            context
          ) && isValid;
      }
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = context.fragments.get(selection.name.value);
      if (!fragment) {
        context.errors.push(
          `Фрагмент ${selection.name.value} не найден (путь: ${path.join('.')})`
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
          context
        ) && isValid;
    }
  }

  return isValid;
}

// Функция для проверки типа переменной
function validateVariableType(variableType: any, schemaType: any): boolean {
  if (!variableType || !schemaType) return false;

  if (variableType.kind === 'NonNullType' && schemaType.kind === 'NON_NULL') {
    return validateVariableType(variableType.type, schemaType.ofType);
  }

  if (variableType.kind === 'ListType' && schemaType.kind === 'LIST') {
    return validateVariableType(variableType.type, schemaType.ofType);
  }

  if (
    variableType.kind === 'NamedType' &&
    (schemaType.kind === 'SCALAR' ||
      schemaType.kind === 'INPUT_OBJECT' ||
      schemaType.kind === 'ENUM')
  ) {
    return variableType.name.value === schemaType.name;
  }

  return false;
}

// Функция для проверки запроса
function validateQuery(queryString: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  try {
    const ast = parse(queryString);
    const context: ValidationContext = {
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
        let rootType = '';

        switch (operationType) {
          case 'query':
            rootType = 'Query';
            break;
          case 'mutation':
            rootType = 'Mutation';
            break;
          case 'subscription':
            rootType = 'Subscription';
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
async function findGraphQLFiles(): Promise<string[]> {
  return glob.glob('src/**/*.{ts,tsx}');
}

// Основная функция для валидации всех запросов
async function validateQueries() {
  const files = await findGraphQLFiles();
  let hasErrors = false;
  let totalQueries = 0;
  let validQueries = 0;

  console.log(colors.cyan('\nНачинаю валидацию GraphQL запросов...\n'));

  for (const file of files) {
    const content = await fs.promises.readFile(file, 'utf8');
    const matches = content.match(queryRegex);

    if (!matches) continue;

    for (const match of matches) {
      totalQueries++;
      const queryString = match.replace(/^gql`/, '').replace(/`$/, '');
      const result = validateQuery(queryString);

      if (result.isValid) {
        validQueries++;
        console.log(
          `${colors.green('✓')} ${colors.gray(file)}: ${colors.green(
            'Валидный запрос'
          )}`
        );
      } else {
        hasErrors = true;
        console.log(
          `${colors.red('✗')} ${colors.gray(file)}: ${colors.red(
            'Ошибки в запросе'
          )}`
        );
        for (const error of result.errors) {
          console.log(`  ${colors.red('•')} ${error}`);
        }
      }

      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.log(`  ${colors.yellow('!')} ${warning}`);
        }
      }
    }
  }

  console.log(
    `\n${colors.cyan('Итоги валидации:')} ${validQueries}/${
      totalQueries
    } запросов валидны\n`
  );

  return !hasErrors;
}
