import React from 'react';
import { Order } from '@/types/api';
import {
  formatDate,
  formatPrice,
  getOrderStatusText,
  getOrderStatusClass,
} from '@/lib/utils';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

interface OrdersListProps {
  orders: Order[];
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  variant?: 'default' | 'table';
  showEmptyState?: boolean;
  error?: Error | null;
}

export function OrdersList({
  orders,
  hasNextPage,
  onLoadMore,
  loading,
  variant = 'default',
  showEmptyState = true,
  error = null,
}: OrdersListProps) {
  if (variant === 'table') {
    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="px-6 py-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-2">
                  Произошла ошибка при загрузке заказов
                </p>
                <p className="text-sm text-gray-600">{error.message}</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (loading && !orders.length) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="px-6 py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded-xl w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded-xl w-full"
                    ></div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (orders.length === 0 && showEmptyState) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  У вас пока нет заказов
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Начните покупки прямо сейчас
                </p>
                <Link
                  href="/"
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors active:scale-95 font-medium"
                >
                  Перейти к покупкам
                </Link>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  #{order.number}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {formatDate(order.creationDatetime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium ${getOrderStatusClass(
                    order.status
                  )}`}
                >
                  {getOrderStatusText(order.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {order.items.totalQuantity} товар(ов)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                {formatPrice(order.items.decimalTotalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
        {hasNextPage && (
          <tfoot>
            <tr>
              <td colSpan={5} className="px-6 py-4">
                <button
                  onClick={onLoadMore}
                  disabled={loading}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2" />
                      Загрузка...
                    </div>
                  ) : (
                    'Загрузить еще заказы'
                  )}
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">
            Произошла ошибка при загрузке заказов
          </p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (loading && !orders.length) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded-xl w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-5 bg-gray-200 rounded-xl w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded-xl w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-xl w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded-xl w-1/2"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-4 bg-gray-200 rounded-xl w-1/4"></div>
                  <div className="h-5 bg-gray-200 rounded-xl w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCartIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            У вас пока нет заказов
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm">
            Начните покупки в нашем каталоге и ваши заказы появятся здесь
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 active:scale-95 font-medium flex items-center"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
              <Link
                href={`/orders/${order.id}`}
                className="text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors flex items-center group"
              >
                Заказ #{order.number}
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span
                className={`px-3 py-1.5 rounded-xl text-sm font-medium ${getOrderStatusClass(
                  order.status
                )} self-start`}
              >
                {getOrderStatusText(order.status)}
              </span>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Дата заказа
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(order.creationDatetime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <ShoppingBagIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Количество
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.items.totalQuantity} товар(ов)
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <BanknotesIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Сумма
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(order.items.decimalTotalPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href={`/orders/${order.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95 font-medium"
              >
                Подробнее о заказе
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-2" />
                Загрузка заказов...
              </div>
            ) : (
              'Загрузить еще заказы'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
