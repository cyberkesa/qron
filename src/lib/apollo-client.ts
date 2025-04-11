import {ApolloClient, ApolloLink, FetchResult, HttpLink, InMemoryCache, Observable,} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';

// Логгер, который выводит сообщения только в режиме разработки
const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};

// Проверка на браузерное окружение
const isBrowser = typeof window !== 'undefined';

interface ApiRegion {
  id: string;
  name: string;
}

// Получение токенов на клиенте
const getTokens = () => {
  if (!isBrowser)
    return {accessToken: null, guestToken: null, refreshToken: null};

  return {
    accessToken: localStorage.getItem('accessToken'),
    guestToken: localStorage.getItem('guestToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

// Получение текущего региона
const getCurrentRegion = (): ApiRegion|null => {
  if (!isBrowser) return null;

  const savedRegion = localStorage.getItem('selectedRegion');
  return savedRegion ? JSON.parse(savedRegion) : null;
};

// Функция для получения гостевого токена
const getGuestToken = async () => {
  try {
    // Получаем сохраненный регион или запрашиваем список регионов
    const regionId = getCurrentRegion()?.id;

    if (!regionId) {
      // Сначала получаем список регионов
      const regionsResponse = await fetch(
          'https://api.tovari-kron.ru/v1/graphql',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
            query GetRegions {
              regions {
                id
                name
              }
            }
          `,
            }),
          },
      );

      const regionsData = await regionsResponse.json();
      const regions = regionsData.data?.regions || [];

      if (regions.length === 0) {
        logger.error('No regions available');
        return null;
      }

      // Возвращаем null, чтобы показать модальное окно выбора
      return null;
    }

    // Выполняем вход как гость
    const guestLoginResponse = await fetch(
        'https://api.tovari-kron.ru/v1/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
          mutation LoginAsGuest($regionId: ID!) {
            logInAsGuest(regionId: $regionId) {
              ... on LogInAsGuestSuccessResult {
                accessToken
                refreshToken
              }
              ... on UnexpectedError {
                message
              }
            }
          }
        `,
            variables: {regionId},
          }),
        },
    );

    const guestData = await guestLoginResponse.json();
    const accessToken = guestData.data?.logInAsGuest?.accessToken;
    const refreshToken = guestData.data?.logInAsGuest?.refreshToken;

    if (!accessToken) {
      logger.error('Failed to get guest access token');
      return null;
    }

    if (accessToken && isBrowser) {
      localStorage.setItem('guestToken', accessToken);
      localStorage.setItem('accessToken', accessToken);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Сохраняем ID региона, для которого получен токен
      localStorage.setItem('tokenRegionId', regionId);
    }

    return accessToken;
  } catch (error) {
    logger.error('Error getting guest token:', error);
    return null;
  }
};

// Проверяет, изменился ли регион и нужно ли перелогиниться
const checkAndUpdateRegion = async () => {
  if (!isBrowser) return null;

  const currentRegion = getCurrentRegion();
  const tokenRegionId = localStorage.getItem('tokenRegionId');

  // Если регион изменился, нужно перелогиниться
  if (currentRegion && currentRegion.id !== tokenRegionId) {
    // Очищаем токены
    localStorage.removeItem('accessToken');
    localStorage.removeItem('guestToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenRegionId');

    // Перелогиниваемся с новым регионом
    return await getGuestToken();
  }

  return null;
};

// Функция для обновления токена доступа
const refreshAccessToken = async () => {
  try {
    const {refreshToken} = getTokens();

    if (!refreshToken) {
      logger.error('No refresh token available');
      return null;
    }

    const response = await fetch('https://api.tovari-kron.ru/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              ... on RefreshTokenSuccessResult {
                accessToken
                refreshToken
              }
              ... on RefreshTokenFailedResult {
                message
              }
              ... on UnexpectedError {
                message
              }
            }
          }
        `,
        variables: {refreshToken},
      }),
    });

    if (!response.ok) {
      logger.error(
          'Ошибка HTTP при обновлении токена:',
          response.status,
          response.statusText,
      );
      return null;
    }

    const data = await response.json();

    // Проверяем наличие ошибок GraphQL
    if (data.errors) {
      logger.error('GraphQL ошибки при обновлении токена:', data.errors);
      return null;
    }

    const result = data.data?.refreshToken;

    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      return result.accessToken;
    } else {
      logger.error('Failed to refresh token');

      // Если не удалось обновить токен, очищаем хранилище
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    logger.error('Error refreshing token:', error);

    // При ошибке тоже очищаем
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

const httpLink = new HttpLink({
  uri: 'https://api.tovari-kron.ru/v1/graphql',
});

// Тип для наблюдателя Observable
interface ObserverInterface {
  next: (value: FetchResult) => void;
  error: (error: unknown) => void;
  complete: () => void;
}

// Обработка ошибок
const errorLink = onError(
    ({graphQLErrors, networkError, operation, forward}) => {
      if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
          // Проверяем на ошибки аутентификации
          const isAuthError = err.message.includes('401') ||
              err.message.includes('Unauthenticated') ||
              err.message.includes('not authenticated') ||
              err.extensions?.code === 'UNAUTHENTICATED';

          if (isAuthError && isBrowser) {
            // Сначала пробуем обновить токен
            if (localStorage.getItem('refreshToken')) {
              return new Observable((observer: ObserverInterface) => {
                refreshAccessToken()
                    .then((newToken) => {
                      if (newToken) {
                        // Повторяем запрос с новым токеном
                        const oldHeaders = operation.getContext().headers;
                        operation.setContext({
                          headers: {
                            ...oldHeaders,
                            authorization: `Bearer ${newToken}`,
                          },
                        });
                        forward(operation).subscribe({
                          next: observer.next.bind(observer),
                          error: observer.error.bind(observer),
                          complete: observer.complete.bind(observer),
                        });
                      } else {
                        // Если не удалось обновить токен, пробуем войти как
                        // гость
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');

                        getGuestToken().then((token) => {
                          if (token) {
                            const oldHeaders = operation.getContext().headers;
                            operation.setContext({
                              headers: {
                                ...oldHeaders,
                                authorization: `Bearer ${token}`,
                              },
                            });
                            forward(operation).subscribe({
                              next: observer.next.bind(observer),
                              error: observer.error.bind(observer),
                              complete: observer.complete.bind(observer),
                            });
                          } else {
                            logger.error('Не удалось получить гостевой токен');
                            observer.error(err);
                          }
                        });
                      }
                    })
                    .catch(() => {
                      observer.error(err);
                    });
              });
            } else {
              // Если нет refresh token, пробуем получить гостевой токен
              localStorage.removeItem('accessToken');
              localStorage.removeItem('guestToken');

              return new Observable((observer: ObserverInterface) => {
                // Получаем новый токен и повторяем запрос
                getGuestToken()
                    .then((token) => {
                      if (token) {
                        const oldHeaders = operation.getContext().headers;
                        // Повторяем запрос с новым токеном
                        operation.setContext({
                          headers: {
                            ...oldHeaders,
                            authorization: token ? `Bearer ${token}` : '',
                          },
                        });
                        forward(operation).subscribe({
                          next: observer.next.bind(observer),
                          error: observer.error.bind(observer),
                          complete: observer.complete.bind(observer),
                        });
                      } else {
                        logger.error('Не удалось получить гостевой токен');
                        observer.error(err);
                      }
                    })
                    .catch(() => {
                      observer.error(err);
                    });
              });
            }
          }
        });
      }

      if (networkError) {
        logger.error(`[Network error]:`, networkError);

        // Проверяем на ошибку авторизации
        const isUnauthorized =
            ('statusCode' in networkError && networkError.statusCode === 401) ||
            networkError.message?.includes('401') ||
            networkError.message?.includes('Unauthorized');

        if (isUnauthorized && isBrowser) {
          // Сначала пробуем обновить токен
          if (localStorage.getItem('refreshToken')) {
            return new Observable((observer: ObserverInterface) => {
              refreshAccessToken()
                  .then((newToken) => {
                    if (newToken) {
                      // Повторяем запрос с новым токеном
                      const oldHeaders = operation.getContext().headers;
                      operation.setContext({
                        headers: {
                          ...oldHeaders,
                          authorization: `Bearer ${newToken}`,
                        },
                      });
                      forward(operation).subscribe({
                        next: observer.next.bind(observer),
                        error: observer.error.bind(observer),
                        complete: observer.complete.bind(observer),
                      });
                    } else {
                      // Если не удалось обновить токен, пробуем войти как гость
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');

                      getGuestToken()
                          .then((token) => {
                            if (token) {
                              const oldHeaders = operation.getContext().headers;
                              operation.setContext({
                                headers: {
                                  ...oldHeaders,
                                  authorization: `Bearer ${token}`,
                                },
                              });
                              forward(operation).subscribe({
                                next: observer.next.bind(observer),
                                error: observer.error.bind(observer),
                                complete: observer.complete.bind(observer),
                              });
                            } else {
                              logger.error(
                                  'Не удалось получить гостевой токен');
                              observer.error(networkError);
                            }
                          })
                          .catch(() => {
                            observer.error(networkError);
                          });
                    }
                  })
                  .catch(() => {
                    observer.error(networkError);
                  });
            });
          } else {
            // Если нет refresh token, очищаем и получаем гостевой
            localStorage.removeItem('accessToken');
            localStorage.removeItem('guestToken');

            return new Observable((observer: ObserverInterface) => {
              getGuestToken()
                  .then((token) => {
                    if (token) {
                      const oldHeaders = operation.getContext().headers;
                      operation.setContext({
                        headers: {
                          ...oldHeaders,
                          authorization: `Bearer ${token}`,
                        },
                      });
                      forward(operation).subscribe({
                        next: observer.next.bind(observer),
                        error: observer.error.bind(observer),
                        complete: observer.complete.bind(observer),
                      });
                    } else {
                      logger.error('Не удалось получить гостевой токен');
                      observer.error(networkError);
                    }
                  })
                  .catch(() => {
                    observer.error(networkError);
                  });
            });
          }
        }
      }

      return forward(operation);
    },
);

// Аутентификация запросов
const authLink = setContext(async (_, {headers}) => {
  // Проверяем изменение региона
  await checkAndUpdateRegion();

  // Получаем актуальные токены после возможного перелогина
  const {accessToken} = getTokens();

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// Инициализация гостевого токена при загрузке клиента
if (isBrowser) {
  const {accessToken, guestToken} = getTokens();
  if (!accessToken && !guestToken) {
    getGuestToken().catch(
        e => logger.error('Error initializing guest token:', e));
  }
}

// Создаем клиент Apollo
export const client = new ApolloClient({
  ssrMode: !isBrowser,  // Включаем SSR режим на сервере
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['sortOrder', 'search', 'categoryId'],
            merge(
                existing = {
                  edges: [],
                },
                incoming,
            ) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
          // Принудительно отключаем кэширование для операций, которые должны
          // быть всегда свежими
          cart: {
            merge: true,  // Всегда обновлять кэш
            read(_, {toReference}) {
              // Возвращаем undefined, чтобы принудить запрос всегда загружаться
              // с сервера
              return undefined;
            },
          },
          viewer: {
            merge: true,
          },
        },
      },
      // Применяем политики кэширования для продуктов
      Product: {
        // Используем ID как ключ для нормализации кэша
        keyFields: ['id'],
        fields: {
          // Важные поля, которые могут обновляться независимо
          price: {
            // Всегда берем свежее значение
            merge: true,
          },
          stockAvailabilityStatus: {
            // Всегда берем свежее значение
            merge: true,
          },
        },
      },
    },
    // Расширенная кастомная логика для разрешения ссылок в кэше
    dataIdFromObject(object: any) {
      // Модифицируем поведение InMemoryCache для предотвращения конфликтов с
      // RSC
      if (object.__typename) {
        // Убедитесь, что есть id, для типов которые должны иметь ID
        if (object.id && typeof object.id === 'string') {
          return `${object.__typename}:${object.id}`;
        }
      }
      return false;  // Возвращаем false вместо null для соответствия типу
    },
  }),
  // Настройки для предотвращения запросов на сервере
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      // Добавляем nextFetchPolicy для лучшего контроля
      nextFetchPolicy: 'cache-first',
      // Отключаем кэширование при ошибках
      errorPolicy: 'all',
      // Увеличиваем таймаут
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Добавляем функцию для сброса только части кэша
export const resetQueryCache = (operationName: string) => {
  client.cache.evict({fieldName: operationName});
  client.cache.gc();
};

// Добавляем функцию для полного сброса кэша Apollo
export const resetApolloCache = async () => {
  try {
    // Сначала очищаем хранилище
    await client.clearStore();
    // Затем сбрасываем хранилище для получения свежих данных
    await client.resetStore();
    logger.log('Apollo cache has been fully reset');
  } catch (error) {
    // Улучшенное логирование ошибок
    logger.error('Error resetting Apollo cache:', error);

    // Попробуем использовать более простой способ очистки кэша
    try {
      client.cache.reset();
      logger.log('Apollo cache has been reset using cache.reset()');
    } catch (fallbackError) {
      logger.error(
          'Failed to reset cache using fallback method:', fallbackError);
      // В браузере можно предложить обновить страницу
      if (typeof window !== 'undefined') {
        logger.log('Suggesting page refresh to resolve cache issues');
      }
    }
  }
};
