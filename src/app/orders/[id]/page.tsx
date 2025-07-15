'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDER } from '@/lib/queries';
import Link from 'next/link';
import { OrderItem, OrderStatus } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ClockIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  number: string;
  status: string;
  creationDatetime: string;
  items: {
    edges: Array<{
      node: OrderItem;
    }>;
    totalQuantity: number;
    decimalTotalPrice: string;
  };
  deliveryFullAddress: string;
  phoneNumber: string;
  region: { id: string; name: string };
}

export default function OrderDetailsPage() {
  // Get ID from params using useParams hook
  const params = useParams();
  const searchParams = useSearchParams();

  // Check if this is a newly created order (redirected from checkout)
  const isNewOrder = searchParams?.get('success') === 'true';

  // Ensure we're properly formatting the ID - URL parameters might be arrays in Next.js
  const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // First, decode any URL encoding (e.g., %3D -> =)
  const urlDecodedId = rawId ? decodeURIComponent(rawId) : '';

  // Format the ID - GraphQL often uses a format like "Order:41511" encoded in base64
  // So if we have a numeric ID, we need to convert it to the right format
  let processedId = urlDecodedId;

  // If we have a numeric ID (or it looks like one), we need to encode it
  if (urlDecodedId && /^\d+$/.test(urlDecodedId)) {
    try {
      // Create the Global Object Identifier format
      const globalId = `Order:${urlDecodedId}`;
      // Encode it as base64
      processedId = btoa(globalId);
      console.log(
        'Converted numeric ID to Global ID:',
        urlDecodedId,
        '->',
        globalId,
        '->',
        processedId
      );
    } catch (e) {
      console.error('Error encoding ID to base64:', e);
    }
  }

  // Use the processed ID for our GraphQL query
  const id = processedId;

  console.log('Order details - ID parameter:', {
    raw: rawId,
    urlDecoded: urlDecodedId,
    processed: processedId,
    final: id,
  });

  const [attemptedFetch, setAttemptedFetch] = useState(false);

  useEffect(() => {
    // For debugging - log to console whether the page is mounting properly
    console.log('Order details page mounted with ID:', id);
    setAttemptedFetch(true);
  }, [id]);

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id },
    fetchPolicy: 'network-only', // Don't use cache to ensure fresh data
    onError: (err) => {
      console.error('GraphQL error fetching order:', err);
      console.error('GraphQL error details:', {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
        clientErrors: err.clientErrors,
        extraInfo: err.extraInfo,
      });
    },
    skip: !id, // Skip the query if no ID is provided
  });

  console.log('Order details - Query result:', {
    data,
    loading,
    error,
    attemptedFetch,
  });

  // Check if the order was found/available
  const order = data?.order as Order | undefined;
  const orderNotFound = !loading && !error && !order;

  // Custom error component for better debugging
  const ErrorDetail = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => (
    <div className="mb-1">
      <strong>{title}:</strong> {message}
    </div>
  );

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'В ожидании';
      case OrderStatus.PROCESSING:
        return 'В обработке';
      case OrderStatus.SHIPPED:
        return 'Отправлен';
      case OrderStatus.DELIVERED:
        return 'Доставлен';
      case OrderStatus.CANCELLED:
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1.5" />;
      case OrderStatus.CANCELLED:
        return <XCircleIcon className="h-5 w-5 text-red-500 mr-1.5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Назад к заказам
          </Link>
          <div className="h-6 bg-gray-200 rounded w-40 animate-fade-in"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
            <div className="flex justify-between pt-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || orderNotFound) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Назад к заказам
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Детали заказа</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <XCircleIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {orderNotFound
              ? 'Заказ не найден'
              : 'Произошла ошибка при загрузке заказа'}
          </h2>
          <p className="text-gray-600 mb-6">
            {orderNotFound
              ? 'Запрашиваемый заказ не существует или был удален.'
              : 'К сожалению, не удалось загрузить данные заказа. Пожалуйста, попробуйте позже.'}
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm text-left">
              <ErrorDetail title="Ошибка" message={error.message} />

              {error.graphQLErrors?.map((e, i) => (
                <ErrorDetail
                  key={i}
                  title={`GraphQL ошибка ${i + 1}`}
                  message={e.message}
                />
              ))}

              {error.networkError && (
                <ErrorDetail
                  title="Сетевая ошибка"
                  message={error.networkError.message}
                />
              )}

              <div className="mt-2 pt-2 border-t border-red-200">
                <ErrorDetail title="ID заказа" message={id || 'не указан'} />
                <ErrorDetail title="Тип ID" message={typeof id} />
                <ErrorDetail
                  title="Монтирование"
                  message={attemptedFetch ? 'Успешно' : 'Не выполнено'}
                />
              </div>
            </div>
          )}
          <Link
            href="/orders"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Вернуться к списку заказов
          </Link>
        </div>
      </div>
    );
  }

  return order ? (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {isNewOrder && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <div className="flex-shrink-0 mr-3">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-800">
              Заказ успешно оформлен!
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Спасибо за ваш заказ! Мы уже приступили к его обработке. Вы будете
              получать уведомления о статусе заказа.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center mb-6">
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 mr-4 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад к заказам
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Заказ #{order.number}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Информация о заказе
          </h2>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {getStatusIcon(order.status)}
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Дата оформления</p>
                <p className="font-medium">
                  {formatDate(order.creationDatetime)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Адрес доставки</p>
                <p className="font-medium">{order.deliveryFullAddress}</p>
                <p className="text-sm text-gray-500">{order.region.name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <PhoneIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Контактный телефон</p>
                <p className="font-medium">{order.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start">
              <TruckIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Доставка</p>
                <p className="font-medium text-green-600">Бесплатно</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100">
          Товары в заказе
        </h2>
        <div className="divide-y divide-gray-100">
          {order.items.edges.map(({ node: item }) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3"
            >
              <div className="flex items-center gap-4">
                {item.product?.images && item.product.images.length > 0 && (
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded border border-gray-200">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {item.quantity} шт.
                    </span>
                    <span className="mx-2">×</span>
                    <span>{formatPrice(item.decimalUnitPrice)}</span>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-gray-900 sm:text-right ml-auto">
                {formatPrice(
                  (parseFloat(item.decimalUnitPrice) * item.quantity).toString()
                )}
              </p>
            </div>
          ))}

          <div className="pt-4 mt-2">
            <div className="flex justify-between items-center py-2 text-gray-600">
              <span>Количество товаров:</span>
              <span>{order.items.totalQuantity} шт.</span>
            </div>
            <div className="flex justify-between items-center py-2 text-gray-600">
              <span>Доставка:</span>
              <span className="text-green-600">Бесплатно</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
              <p className="font-semibold text-lg">Итого:</p>
              <p className="font-bold text-xl text-blue-600">
                {formatPrice(order.items.decimalTotalPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
