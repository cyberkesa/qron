import {ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';

import {GET_REGIONS, LOGIN_AS_GUEST, REFRESH_TOKEN} from './queries';

// Определяем, что мы в браузере
const isBrowser = typeof window !== 'undefined';

// Получение токенов на клиенте
const getTokens = () => {
  if (!isBrowser)
    return {accessToken: null, guestToken: null, refreshToken: null};

  return {
    accessToken: localStorage.getItem('accessToken'),
    guestToken: localStorage.getItem('guestToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// Получение текущего региона
const getCurrentRegion = () => {
  if (!isBrowser) return null;

  const savedRegion = localStorage.getItem('selectedRegion');
  return savedRegion ? JSON.parse(savedRegion) : null;
};

// Сохранение выбранного региона
const saveRegion = (region: {id: string, name: string}) => {
  if (isBrowser && region) {
    console.log('Сохраняем регион:', region.name);
    localStorage.setItem('selectedRegion', JSON.stringify(region));
  }
};

// Функция для получения гостевого токена
const getGuestToken = async () => {
  try {
    console.log('Запрашиваем гостевой токен...');

    // Получаем сохраненный регион или запрашиваем список регионов
    let regionId = getCurrentRegion()?.id;

    console.log('Текущий регион:', regionId ? 'ID: ' + regionId : 'не задан');

    if (!regionId) {
      console.log('Регион не найден, запрашиваем список регионов...');

      // Сначала получаем список регионов
      const regionsResponse =
          await fetch('https://api.tovari-kron.ru/v1/graphql', {
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
          `
            }),
          });

      const regionsData = await regionsResponse.json();
      const regions = regionsData.data?.regions || [];

      if (regions.length === 0) {
        console.error('No regions available');
        return null;
      }

      // ВАЖНО: Не выбираем автоматически первый регион,
      // вместо этого возвращаем null, чтобы показать модальное окно выбора
      console.log('Найдены регионы, но пользователь должен выбрать свой');
      return null;
    }

    // Выполняем вход как гость
    console.log('Выполняем вход как гость с регионом ID:', regionId);

    const guestLoginResponse =
        await fetch('https://api.tovari-kron.ru/v1/graphql', {
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
            variables: {regionId}
          }),
        });

    const guestData = await guestLoginResponse.json();

    console.log(
        'Ответ на запрос гостевого входа:', JSON.stringify(guestData, null, 2));

    const accessToken = guestData.data?.logInAsGuest?.accessToken;
    const refreshToken = guestData.data?.logInAsGuest?.refreshToken;

    if (!accessToken) {
      console.error('Failed to get guest access token:', guestData);
      return null;
    }

    console.log('Вход гостем выполнен успешно');

    if (accessToken && isBrowser) {
      console.log('Сохраняем токены гостя в локальное хранилище');
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
    console.error('Error getting guest token:', error);
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
    console.log(
        'Регион изменился. Старый:', tokenRegionId, 'Новый:', currentRegion.id);
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
    console.log('Обновляем access token...');
    const {refreshToken} = getTokens();

    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    console.log(
        'Отправляем запрос на обновление токена с refreshToken:',
        refreshToken.substring(0, 10) + '...');

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
        variables: {refreshToken}
      }),
    });

    if (!response.ok) {
      console.error(
          'Ошибка HTTP при обновлении токена:', response.status,
          response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(
        'Ответ на запрос обновления токена:', JSON.stringify(data, null, 2));

    // Проверяем наличие ошибок GraphQL
    if (data.errors) {
      console.error('GraphQL ошибки при обновлении токена:', data.errors);
      return null;
    }

    const result = data.data?.refreshToken;

    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      console.log('Token refreshed successfully');
      return result.accessToken;
    } else {
      console.error(
          'Failed to refresh token:', result?.message || 'Unknown error');

      // Выводим более подробную информацию о проблеме
      if (result) {
        console.error('Детали ошибки:', {
          hasMessage: !!result.message,
          resultType: typeof result,
          resultKeys: Object.keys(result)
        });
      } else {
        console.error('Ответ refreshToken отсутствует или null');
      }

      // Если не удалось обновить токен, очищаем хранилище
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    console.error(
        'Error details:',
        {name: error.name, message: error.message, stack: error.stack});
    // При ошибке тоже очищаем
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

const httpLink = new HttpLink({
  uri: 'https://api.tovari-kron.ru/v1/graphql',
});

// Добавляем логирование для отладки запросов
const loggerLink = new ApolloLink((operation, forward) => {
  console.log(`[GraphQL Request] Operation: ${operation.operationName}`);

  return forward(operation).map(response => {
    console.log(
        `[GraphQL Response] Operation: ${operation.operationName}`, response);

    // Логирование ошибок для корзины
    if (operation.operationName === 'RemoveFromCart' ||
        operation.operationName === 'UpdateCartItemQuantity' ||
        operation.operationName === 'AddToCart') {
      if (response.errors && response.errors.length > 0) {
        console.error(
            `[GraphQL Cart Error] ${operation.operationName}:`,
            response.errors);
      } else if (response.data) {
        console.log(
            `[GraphQL Cart Success] ${operation.operationName}:`,
            response.data);
      }
    }

    return response;
  });
});

// Обработка ошибок
const errorLink = onError(({
                            graphQLErrors,
                            networkError,
                            operation,
                            forward
                          }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      console.log(`[GraphQL error]: Message: ${err.message}`);

      // Проверяем на ошибки аутентификации
      const isAuthError = err.message.includes('401') ||
          err.message.includes('Unauthenticated') ||
          err.message.includes('not authenticated') ||
          err.extensions?.code === 'UNAUTHENTICATED';

      if (isAuthError && isBrowser) {
        console.log('Обнаружена ошибка аутентификации, пробуем обновить токен');
        // Сначала пробуем обновить токен
        if (localStorage.getItem('refreshToken')) {
          return new Observable((observer: any) => {
            refreshAccessToken()
                .then(newToken => {
                  if (newToken) {
                    console.log('Токен обновлен, повторяем запрос');
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
                    console.log(
                        'Не удалось обновить токен, пробуем войти как гость');
                    // Если не удалось обновить токен, пробуем войти как гость
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    getGuestToken().then(token => {
                      if (token) {
                        console.log(
                            'Получен новый гостевой токен, повторяем запрос');
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
                        console.error('Не удалось получить гостевой токен');
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
          console.log('Нет refresh token, пробуем получить гостевой токен');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('guestToken');

          return new Observable((observer: any) => {
            // Получаем новый токен и повторяем запрос
            getGuestToken()
                .then(token => {
                  if (token) {
                    console.log(
                        'Получен новый гостевой токен, повторяем запрос');
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
                    console.error('Не удалось получить гостевой токен');
                    observer.error(err);
                  }
                })
                .catch(() => {
                  observer.error(err);
                });
          });
        }
      }
    }
  }

  if (networkError) {
    console.log(`[Network error]:`, networkError);

    // Проверяем на ошибку авторизации
    const isUnauthorized =
        'statusCode' in networkError && networkError.statusCode === 401 ||
        networkError.message?.includes('401') ||
        networkError.message?.includes('Unauthorized');

    if (isUnauthorized && isBrowser) {
      console.log('Обнаружена ошибка сети с кодом 401, пробуем обновить токен');
      // Сначала пробуем обновить токен
      if (localStorage.getItem('refreshToken')) {
        return new Observable((observer: any) => {
          refreshAccessToken()
              .then(newToken => {
                if (newToken) {
                  console.log('Токен обновлен, повторяем запрос');
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
                  console.log(
                      'Не удалось обновить токен, пробуем войти как гость');
                  // Если не удалось обновить токен, пробуем войти как гость
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');

                  getGuestToken()
                      .then(token => {
                        if (token) {
                          console.log(
                              'Получен новый гостевой токен, повторяем запрос');
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
                          console.error('Не удалось получить гостевой токен');
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
        console.log('Нет refresh token, получаем гостевой токен');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('guestToken');

        return new Observable((observer: any) => {
          getGuestToken()
              .then(token => {
                if (token) {
                  console.log('Получен новый гостевой токен, повторяем запрос');
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
                  console.error('Не удалось получить гостевой токен');
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
});

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
    }
  };
});

// Инициализация гостевого токена при загрузке клиента
if (isBrowser) {
  console.log('Инициализация Apollo клиента в браузере');
  const {accessToken, guestToken} = getTokens();
  if (!accessToken && !guestToken) {
    console.log('Токены отсутствуют, инициализируем гостевой токен');
    getGuestToken().then(token => {
      console.log(
          'Инициализация гостевого токена:',
          token ? 'Успешно' : 'Не удалось получить токен');
    });
  } else {
    console.log(
        'Токены уже присутствуют:',
        accessToken ? 'Access token' : 'Guest token');
  }
}

// Создаем клиент Apollo
export const client = new ApolloClient({
  ssrMode: !isBrowser,  // Включаем SSR режим на сервере
  link: ApolloLink.from([errorLink, authLink, loggerLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['sortOrder', 'search', 'categoryId'],
            merge(
                existing = {
                  edges: []
                },
                incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
        },
      },
    },
  }),
  // Настройки для предотвращения запросов на сервере
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});