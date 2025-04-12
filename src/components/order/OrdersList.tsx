import React from 'react';
import { Order } from '@/types/api';
import {
  formatDate,
  formatPrice,
  getOrderStatusText,
  getOrderStatusClass,
} from '@/lib/utils';
import Link from 'next/link';

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
              <p className="text-red-600">
                Произошла ошибка при загрузке заказов
              </p>
              <p className="text-sm text-gray-600 mt-2">{error.message}</p>
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
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded w-full mb-2"
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
            <td colSpan={5} className="px-6 py-8 text-center">
              <p className="text-gray-600">У вас пока нет заказов</p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
              >
                Перейти к покупкам
              </Link>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  #{order.number}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDate(order.creationDatetime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getOrderStatusClass(
                    order.status
                  )}`}
                >
                  {getOrderStatusText(order.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.items.totalQuantity} товар(ов)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
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
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще заказы'}
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
      <div className="text-center py-8">
        <p className="text-red-600">Произошла ошибка при загрузке заказов</p>
        <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  if (loading && !orders.length) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">У вас пока нет заказов</p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Перейти к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <Link
              href={`/orders/${order.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Заказ #{order.number}
            </Link>
            <span
              className={`px-3 py-1 rounded-full text-xs ${getOrderStatusClass(
                order.status
              )}`}
            >
              {getOrderStatusText(order.status)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Дата: {formatDate(order.creationDatetime)}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">{order.items.totalQuantity} товар(ов)</div>
            <div className="font-semibold">
              {formatPrice(order.items.decimalTotalPrice)}
            </div>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {loading ? 'Загрузка...' : 'Загрузить еще заказы'}
        </button>
      )}
    </div>
  );
}
