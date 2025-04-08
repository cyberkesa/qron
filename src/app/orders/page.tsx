"use client";

import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import Link from "next/link";
import { useState } from "react";
import { Order, OrderStatus } from "@/types/api";

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "ALL">("ALL");
  const { data, loading, error, fetchMore } = useQuery(GET_ORDERS, {
    variables: {
      first: 10,
    },
  });

  const orders =
    data?.orders?.edges?.map((edge: { node: Order }) => edge.node) || [];
  const hasNextPage = data?.orders?.pageInfo?.hasNextPage || false;
  const endCursor = data?.orders?.pageInfo?.endCursor;

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Отображение статуса заказа
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          text: "В обработке",
          className: "bg-yellow-100 text-yellow-800",
        };
      case OrderStatus.PROCESSING:
        return {
          text: "Комплектуется",
          className: "bg-blue-100 text-blue-800",
        };
      case OrderStatus.SHIPPED:
        return {
          text: "Отправлен",
          className: "bg-purple-100 text-purple-800",
        };
      case OrderStatus.DELIVERED:
        return {
          text: "Доставлен",
          className: "bg-green-100 text-green-800",
        };
      case OrderStatus.CANCELLED:
        return {
          text: "Отменен",
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          text: status,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          after: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            orders: {
              ...fetchMoreResult.orders,
              edges: [...prev.orders.edges, ...fetchMoreResult.orders.edges],
            },
          };
        },
      });
    }
  };

  const filteredOrders =
    activeStatus === "ALL"
      ? orders
      : orders.filter((order: Order) => order.status === activeStatus);

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка заказов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ваши заказы</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error.message || "Произошла ошибка при загрузке заказов"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link
          href="/profile"
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          ← Назад в профиль
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ваши заказы</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Навигация
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Личные данные
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100 font-medium"
                >
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/addresses"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Адреса доставки
                </Link>
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
              Фильтр по статусу
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveStatus("ALL")}
                  className={`w-full text-left py-2 px-3 rounded ${
                    activeStatus === "ALL"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Все заказы
                </button>
              </li>
              {Object.values(OrderStatus).map((status) => {
                const label = getStatusLabel(status);
                return (
                  <li key={status}>
                    <button
                      onClick={() => setActiveStatus(status)}
                      className={`w-full text-left py-2 px-3 rounded ${
                        activeStatus === status
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">
                {activeStatus === "ALL"
                  ? "У вас еще нет заказов"
                  : `У вас нет заказов со статусом "${
                      getStatusLabel(activeStatus).text
                    }"`}
              </p>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Перейти к покупкам
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Мобильный вид (карточки) */}
              <div className="md:hidden">
                {filteredOrders.map((order: Order) => {
                  const statusLabel = getStatusLabel(order.status);
                  return (
                    <div
                      key={order.id}
                      className="border-b border-gray-200 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            Заказ #{order.number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.creationDatetime)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusLabel.className}`}
                        >
                          {statusLabel.text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="font-medium">
                          {order.items.decimalTotalPrice} ₽
                        </p>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Десктопный вид (таблица) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Номер заказа
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Дата
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Статус
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Сумма
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order: Order) => {
                      const statusLabel = getStatusLabel(order.status);
                      return (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.creationDatetime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${statusLabel.className}`}
                            >
                              {statusLabel.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.items.decimalTotalPrice} ₽
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Подробнее
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {hasNextPage && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    className="w-full px-4 py-2 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Загрузить еще
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
