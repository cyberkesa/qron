'use client';

import { useQuery } from '@apollo/client';
import { GET_VIEWER, GET_ORDERS, GET_DELIVERY_ADDRESSES } from '@/lib/queries';
import Link from 'next/link';
import { OrderStatus, DeliveryAddress } from '@/types/api';
import {
  PencilSquareIcon,
  PlusIcon,
  MapPinIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function ProfilePage() {
  // Запрос данных пользователя
  const { data: userData, loading: userLoading } = useQuery(GET_VIEWER);

  // Определяем, авторизован ли пользователь
  const isLoggedIn = userData?.viewer?.__typename === 'RegisteredViewer';

  // Запрос заказов
  const { data: ordersData } = useQuery(GET_ORDERS, {
    variables: {
      first: 100,
    },
    skip: !isLoggedIn, // Пропускаем запрос, если пользователь не авторизован
  });

  // Запрос адресов доставки (только для авторизованных пользователей)
  const {
    data: addressesData,
    loading: addressesLoading,
    error: addressesError,
  } = useQuery(GET_DELIVERY_ADDRESSES, {
    fetchPolicy: 'network-only', // Принудительная загрузка с сервера
    skip: !isLoggedIn, // Пропускаем запрос, если пользователь не авторизован
    onError: (error) => {
      console.error('Ошибка загрузки адресов:', error);
    },
  });

  // Отладочный код
  useEffect(() => {
    console.log('Статус авторизации:', isLoggedIn);
    if (addressesData) {
      console.log('Загруженные адреса:', addressesData);
    }
    if (addressesError) {
      console.error('Ошибка при загрузке адресов:', addressesError);
    }
  }, [addressesData, addressesError, isLoggedIn]);

  // Calculate order statistics
  const orders =
    ordersData?.orders?.edges?.map((edge: { node: any }) => edge.node) || [];
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order: { status: OrderStatus }) =>
    [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(
      order.status
    )
  ).length;

  const user = userData?.viewer;
  const addresses = addressesData?.deliveryAddresses || [];
  const displayAddresses = addresses.slice(0, 2); // Only show first 2 addresses

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isLoggedIn && !userLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg">
        <p className="mb-4 font-medium">
          Для доступа к профилю необходимо авторизоваться
        </p>
        <Link
          href="/login?redirect=/profile"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-3 text-blue-600">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Личные данные</h2>
          <Link
            href="/profile/edit"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4 mr-1" />
            <span>Редактировать</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <div className="text-sm text-gray-500 mb-1">Имя</div>
            <div className="font-medium text-gray-900">{user?.name || '—'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-medium text-gray-900">
              {user?.emailAddress || '—'}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Телефон</div>
            <div className="flex flex-col">
              <div className="font-medium text-gray-900">
                {user?.phoneNumber || '—'}
              </div>
              {!user?.phoneNumber && (
                <div className="text-xs text-gray-500 mt-1">
                  Номер телефона можно указать при оформлении заказа
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Регион</div>
            <div className="font-medium text-gray-900">
              {user?.region?.name || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Order statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {totalOrders}
          </div>
          <div className="text-gray-500">Всего заказов</div>
          <Link
            href="/profile/orders"
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Перейти к списку заказов →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md flex flex-col items-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {activeOrders}
          </div>
          <div className="text-gray-500">Активных заказов</div>
          {activeOrders > 0 && (
            <Link
              href="/profile/orders"
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              Отслеживать заказы →
            </Link>
          )}
        </div>
      </div>

      {/* Addresses section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Адреса доставки
          </h2>
          <Link
            href="/profile/addresses"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Управление адресами
          </Link>
        </div>

        {addressesLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <div className="ml-3 text-sm text-blue-600">
              Загрузка адресов...
            </div>
          </div>
        ) : addressesError ? (
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-red-700 flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Ошибка загрузки адресов</p>
              <p className="text-sm mt-1">{addressesError.message}</p>
            </div>
          </div>
        ) : addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {displayAddresses.map((address: DeliveryAddress) => (
              <div
                key={address.id}
                className="flex items-start p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-gray-800">{address.fullAddress}</p>
                </div>
              </div>
            ))}

            {addresses.length > displayAddresses.length && (
              <div className="text-center py-3 border-t border-gray-100 mt-3">
                <Link
                  href="/profile/addresses"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Показать все адреса ({addresses.length}) →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              У вас пока нет сохраненных адресов доставки
            </p>
            <Link
              href="/profile/addresses/new"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Добавить адрес
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
