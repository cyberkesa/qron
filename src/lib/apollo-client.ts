import {
  ApolloClient,
  ApolloLink,
  FetchResult,
  HttpLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Replace console.log with a logger function that only logs in development
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

// Определяем, что мы в браузере
const isBrowser = typeof window !== 'undefined';

interface ApiRegion {
  id: string;
  name: string;
}

// Получение токенов на клиенте
const getTokens = () => {
  if (!isBrowser)
    return { accessToken: null, guestToken: null, refreshToken: null };

  return {
    accessToken: localStorage.getItem('accessToken'),
    guestToken: localStorage.getItem('guestToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
};

// Получение текущего региона
const getCurrentRegion = (): ApiRegion | null => {
  if (!isBrowser) return null;

  const savedRegion = localStorage.getItem('selectedRegion');
  return savedRegion ? JSON.parse(savedRegion) : null;
};

// Функция для получения гостевого токена
const getGuestToken = async () => {
  try {
    logger.log('Запрашиваем гостевой токен...');

    // Получаем сохраненный регион или запрашиваем список регионов
    const regionId = getCurrentRegion()?.id;

    logger.log('Текущий регион:', regionId ? 'ID: ' + regionId : 'не задан');

    if (!regionId) {
      logger.log('Регион не найден, запрашиваем список регионов...');

      // Сначала получаем список регионов
      const regionsResponse = await fetch(
        process.env.NEXT_PUBLIC_API_URL ||
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
        }
      );

      const regionsData = await regionsResponse.json();
      const regions = regionsData.data?.regions || [];

      if (regions.length === 0) {
        logger.error('No regions available');
        return null;
      }

      // ВАЖНО: Не выбираем автоматически первый регион,
      // вместо этого возвращаем null, чтобы показать модальное окно выбора
      logger.log('Найдены регионы, но пользователь должен выбрать свой');
      return null;
    }

    // Выполняем вход как гость
    logger.log('Выполняем вход как гость с регионом ID:', regionId);

    const guestLoginResponse = await fetch(
      process.env.NEXT_PUBLIC_API_URL ||
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
          variables: { regionId },
        }),
      }
    );

    const guestData = await guestLoginResponse.json();

    logger.log(
      'Ответ на запрос гостевого входа:',
      JSON.stringify(guestData, null, 2)
    );

    const accessToken = guestData.data?.logInAsGuest?.accessToken;
    const refreshToken = guestData.data?.logInAsGuest?.refreshToken;

    if (!accessToken) {
      logger.error('Failed to get guest access token:', guestData);
      return null;
    }

    logger.log('Вход гостем выполнен успешно');

    if (accessToken && isBrowser) {
      logger.log('Сохраняем токены гостя в локальное хранилище');
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

  // Проверяем, авторизован ли пользователь (не гость)
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const guestToken = localStorage.getItem('guestToken');
  const isAuthenticated =
    !!accessToken &&
    !!refreshToken &&
    (!guestToken || accessToken !== guestToken);

  // Если регион изменился, но пользователь авторизован,
  // просто обновляем tokenRegionId без сброса авторизации
  if (currentRegion && currentRegion.id !== tokenRegionId) {
    logger.log(
      'Регион изменился. Старый:',
      tokenRegionId,
      'Новый:',
      currentRegion.id
    );

    if (isAuthenticated) {
      // Для авторизованных пользователей просто обновляем ID региона
      // без сброса авторизации
      logger.log(
        'Пользователь авторизован, обновляем ID региона без сброса токенов'
      );
      localStorage.setItem('tokenRegionId', currentRegion.id);
      return null;
    } else {
      // Для гостей очищаем токены и перелогиниваемся с новым регионом
      logger.log('Гостевой пользователь, сбрасываем токены');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('guestToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenRegionId');

      // Перелогиниваемся с новым регионом
      return await getGuestToken();
    }
  }

  return null;
};

// Функция для обновления токена доступа
const refreshAccessToken = async () => {
  try {
    logger.log('Обновляем access token...');
    const { refreshToken } = getTokens();

    if (!refreshToken) {
      logger.error('No refresh token available');
      return null;
    }

    logger.log(
      'Отправляем запрос на обновление токена с refreshToken:',
      refreshToken.substring(0, 10) + '...'
    );

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL ||
        'https://api.tovari-kron.ru/v1/graphql',
      {
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
          variables: { refreshToken },
        }),
      }
    );

    if (!response.ok) {
      logger.error(
        'Ошибка HTTP при обновлении токена:',
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    logger.log(
      'Ответ на запрос обновления токена:',
      JSON.stringify(data, null, 2)
    );

    // Проверяем наличие ошибок GraphQL
    if (data.errors) {
      logger.error('GraphQL ошибки при обновлении токена:', data.errors);
      return null;
    }

    const result = data.data?.refreshToken;

    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      logger.log('Token refreshed successfully');
      return result.accessToken;
    } else {
      logger.error(
        'Failed to refresh token:',
        result?.message || 'Unknown error'
      );

      // Выводим более подробную информацию о проблеме
      if (result) {
        logger.error('Детали ошибки:', {
          hasMessage: !!result.message,
          resultType: typeof result,
          resultKeys: Object.keys(result),
        });
      } else {
        logger.error('Ответ refreshToken отсутствует или null');
      }

      // Если не удалось обновить токен, очищаем хранилище
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error: unknown) {
    logger.error('Error refreshing token:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      logger.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
    }
    // При ошибке тоже очищаем
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

const httpLink = new HttpLink({
  uri:
    process.env.NEXT_PUBLIC_API_URL || 'https://api.tovari-kron.ru/v1/graphql',
});

// Добавляем логирование для отладки запросов
const loggerLink = new ApolloLink((operation, forward) => {
  const operationName = operation.operationName;
  const isCartOperation =
    operationName === 'RemoveFromCart' ||
    operationName === 'UpdateCartItemQuantity' ||
    operationName === 'AddToCart';

  if (isCartOperation) {
    logger.log(
      `[Cart Operation] ${operationName} started with variables:`,
      operation.variables
    );
  } else {
    logger.log(`[GraphQL Request] Operation: ${operationName}`);
  }

  return forward(operation).map((response) => {
    if (isCartOperation) {
      if (response.errors && response.errors.length > 0) {
        logger.error(`[Cart Error] ${operationName} failed:`, response.errors);
      } else if (response.data) {
        logger.log(`[Cart Success] ${operationName} completed:`, response.data);
      }
    } else {
      logger.log(`[GraphQL Response] Operation: ${operationName}`, response);
    }

    return response;
  });
});

// Тип для наблюдателя Observable
interface ObserverInterface {
  next: (value: FetchResult) => void;
  error: (error: unknown) => void;
  complete: () => void;
}

// Обработка ошибок
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((err) => {
        logger.log(`[GraphQL error]: Message: ${err.message}`);

        // Проверяем на ошибки аутентификации
        const isAuthError =
          err.message.includes('401') ||
          err.message.includes('Unauthenticated') ||
          err.message.includes('not authenticated') ||
          err.extensions?.code === 'UNAUTHENTICATED';

        if (isAuthError && isBrowser) {
          logger.log(
            'Обнаружена ошибка аутентификации, пробуем обновить токен'
          );
          // Сначала пробуем обновить токен
          if (localStorage.getItem('refreshToken')) {
            return new Observable((observer: ObserverInterface) => {
              refreshAccessToken()
                .then((newToken) => {
                  if (newToken) {
                    logger.log('Токен обновлен, повторяем запрос');
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
                    logger.log(
                      'Не удалось обновить токен, пробуем войти как гость'
                    );
                    // Если не удалось обновить токен, пробуем войти как
                    // гость
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    getGuestToken().then((token) => {
                      if (token) {
                        logger.log(
                          'Получен новый гостевой токен, повторяем запрос'
                        );
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
            logger.log('Нет refresh token, пробуем получить гостевой токен');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('guestToken');

            return new Observable((observer: ObserverInterface) => {
              // Получаем новый токен и повторяем запрос
              getGuestToken()
                .then((token) => {
                  if (token) {
                    logger.log(
                      'Получен новый гостевой токен, повторяем запрос'
                    );
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
        logger.log(
          'Обнаружена ошибка сети с кодом 401, пробуем обновить токен'
        );
        // Сначала пробуем обновить токен
        if (localStorage.getItem('refreshToken')) {
          return new Observable((observer: ObserverInterface) => {
            refreshAccessToken()
              .then((newToken) => {
                if (newToken) {
                  logger.log('Токен обновлен, повторяем запрос');
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
                  logger.log(
                    'Не удалось обновить токен, пробуем войти как гость'
                  );
                  // Если не удалось обновить токен, пробуем войти как гость
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');

                  getGuestToken()
                    .then((token) => {
                      if (token) {
                        logger.log(
                          'Получен новый гостевой токен, повторяем запрос'
                        );
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
                }
              })
              .catch(() => {
                observer.error(networkError);
              });
          });
        } else {
          // Если нет refresh token, очищаем и получаем гостевой
          logger.log('Нет refresh token, получаем гостевой токен');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('guestToken');

          return new Observable((observer: ObserverInterface) => {
            getGuestToken()
              .then((token) => {
                if (token) {
                  logger.log('Получен новый гостевой токен, повторяем запрос');
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
  }
);

// Аутентификация запросов
const authLink = setContext(async (_, { headers }) => {
  // Проверяем изменение региона
  await checkAndUpdateRegion();

  // Получаем актуальные токены после возможного перелогина
  const { accessToken } = getTokens();

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// Инициализация гостевого токена при загрузке клиента
if (isBrowser) {
  logger.log('Инициализация Apollo клиента в браузере');
  const { accessToken, guestToken } = getTokens();
  if (!accessToken && !guestToken) {
    logger.log('Токены отсутствуют, инициализируем гостевой токен');
    getGuestToken().then((token) => {
      logger.log(
        'Инициализация гостевого токена:',
        token ? 'Успешно' : 'Не удалось получить токен'
      );
    });
  } else {
    logger.log(
      'Токены уже присутствуют:',
      accessToken ? 'Access token' : 'Guest token'
    );
  }
}

// Создаем клиент Apollo
export const client = new ApolloClient({
  ssrMode: !isBrowser, // Включаем SSR режим на сервере
  link: ApolloLink.from([errorLink, authLink, loggerLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['sortOrder', 'search', 'categoryId'],
            merge(
              existing = {
                edges: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
              incoming
            ) {
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo,
              };
            },
          },
          // Кэшируем категории агрессивно - они редко меняются
          rootCategories: {
            merge: false, // Заменяем полностью при обновлении
          },
          // Кэшируем корзину с merge стратегией
          cart: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          // Кэшируем пользователя
          viewer: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
      Product: {
        fields: {
          // Кэшируем изображения товаров
          images: {
            merge: false,
          },
        },
      },
      Category: {
        fields: {
          // Кэшируем дочерние категории
          children: {
            merge: false,
          },
        },
      },
    },
  }),
  // Оптимизированные настройки по умолчанию
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first', // Приоритет кэшу для лучшей производительности
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: false, // Уменьшаем количество ре-рендеров
    },
    query: {
      fetchPolicy: 'cache-first', // Используем кэш когда возможно
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Включаем дедупликацию запросов
  assumeImmutableResults: true,
});
