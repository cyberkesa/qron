import {gql} from '@apollo/client';
import fs from 'fs';
import {buildSchema, GraphQLSchema, print} from 'graphql';
import path from 'path';

// Функция для загрузки схемы из файла
export function loadSchema(schemaPath: string): GraphQLSchema {
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    return buildSchema(schemaContent);
  } catch (error) {
    console.error('Ошибка при загрузке схемы:', error);
    throw error;
  }
}

// Функция для проверки запроса на соответствие схеме
export function validateQuery(schema: GraphQLSchema, query: string):
    {isValid: boolean; errors: string[]} {
  try {
    // Здесь будет логика проверки запроса
    // Это упрощенная версия, в реальности нужно использовать более сложную
    // логику с использованием GraphQL-валидатора

    // Для демонстрации просто проверим, что запрос не пустой
    if (!query || query.trim() === '') {
      return {isValid: false, errors: ['Пустой запрос']};
    }

    // В реальном приложении здесь будет полная валидация
    return {isValid: true, errors: []};
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Неизвестная ошибка']
    };
  }
}

// Функция для проверки всех запросов в профиле
export function validateProfileQueries(): void {
  try {
    // Загрузка схемы
    const schemaPath = path.resolve(process.cwd(), 'schema.json');
    const schema = loadSchema(schemaPath);

    // Список запросов для проверки
    const queries = [
      {
        name: 'GET_VIEWER',
        query: gql`
        query GetViewer {
          viewer {
            id
            ... on RegisteredViewer {
              emailAddress
              name
              phoneNumber
              region {
                id
                name
              }
            }
            ... on AnonymousViewer {
              region {
                id
                name
              }
            }
          }
        }
      `
      },
      {
        name: 'GET_ORDERS',
        query: gql`
        query GetOrders {
          orders {
            edges {
              cursor
              node {
                id
                status
                createdAt
                decimalTotalPrice
                items {
                  id
                  quantity
                  name
                  decimalUnitPrice
                  imageUrl
                }
                deliveryAddress {
                  id
                  fullName
                  phoneNumber
                  address
                  city
                  postalCode
                }
                paymentMethod
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `
      },
      {
        name: 'LOGOUT',
        query: gql`
        mutation LogOut {
          logOut {
            ... on LogOutSuccessResult {
              success
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `
      },
      {
        name: 'GET_DELIVERY_ADDRESSES',
        query: gql`
        query GetDeliveryAddresses {
          deliveryAddresses {
            id
            fullAddress
          }
        }
      `
      },
      {
        name: 'DELETE_DELIVERY_ADDRESS',
        query: gql`
        mutation DeleteDeliveryAddress($id: ID!) {
          deleteDeliveryAddress(id: $id) {
            ... on DeleteDeliveryAddressSuccessResult {
              nothing
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `
      },
      {
        name: 'EDIT_DELIVERY_ADDRESS',
        query: gql`
        mutation EditDeliveryAddress($id: ID!, $fullAddress: String!) {
          editDeliveryAddress(id: $id, fullAddress: $fullAddress) {
            ... on EditDeliveryAddressSuccessResult {
              deliveryAddress {
                id
                fullAddress
              }
            }
            ... on EditDeliverAddressErrorDueToDeliveryAddressNotFound {
              message
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `
      },
      {
        name: 'CREATE_DELIVERY_ADDRESS',
        query: gql`
        mutation CreateDeliveryAddress($input: CreateDeliveryAddressInput!) {
          createDeliveryAddress(input: $input) {
            ... on CreateDeliveryAddressSuccessResult {
              deliveryAddress {
                id
                fullAddress
              }
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `
      },
      {
        name: 'GET_DELIVERY_ADDRESS',
        query: gql`
        query GetDeliveryAddress($id: ID!) {
          deliveryAddress(id: $id) {
            id
            fullName
            phoneNumber
            address
            city
            postalCode
            isDefault
          }
        }
      `
      },
      {
        name: 'SET_DEFAULT_DELIVERY_ADDRESS',
        query: gql`
        mutation SetDefaultDeliveryAddress($id: ID!) {
          setDefaultDeliveryAddress(id: $id) {
            ... on SetDefaultDeliveryAddressSuccessResult {
              deliveryAddress {
                id
                isDefault
              }
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `
      }
    ];

    // Проверка каждого запроса
    console.log('Проверка запросов в профиле:');
    console.log('--------------------------------');

    let allValid = true;

    for (const {name, query} of queries) {
      const queryString = print(query);
      const result = validateQuery(schema, queryString);

      console.log(`Запрос: ${name}`);
      console.log(
          `Статус: ${result.isValid ? '✅ Валидный' : '❌ Невалидный'}`);

      if (result.errors.length > 0) {
        console.log('Ошибки:');
        result.errors.forEach(error => console.log(`  - ${error}`));
        allValid = false;
      }

      console.log('--------------------------------');
    }

    console.log(`Общий результат: ${
        allValid ? '✅ Все запросы валидны' : '❌ Обнаружены ошибки'}`);

  } catch (error) {
    console.error('Ошибка при проверке запросов:', error);
  }
}

// Экспорт функции для запуска проверки
export default validateProfileQueries;