"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import { OrdersList } from "@/components/order/OrdersList";
import { OrderStatus } from "@/types/api";

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);

  const { data, loading, error, fetchMore } = useQuery(GET_ORDERS, {
    variables: {
      first: 10,
      status: activeStatus,
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleLoadMore = () => {
    if (data?.orders?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.orders.pageInfo.endCursor,
          status: activeStatus,
        },
      });
    }
  };

<<<<<<< HEAD
  const statuses: Array<{ value: OrderStatus | null; label: string }> = [
    { value: null, label: "Все" },
    { value: OrderStatus.PENDING, label: "Ожидает обработки" },
    { value: OrderStatus.PROCESSING, label: "В обработке" },
    { value: OrderStatus.SHIPPED, label: "Отправлен" },
    { value: OrderStatus.DELIVERED, label: "Доставлен" },
    { value: OrderStatus.CANCELLED, label: "Отменен" },
  ];
=======
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Ошибка загрузки заказов
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error.message || "Произошла ошибка при загрузке заказов"}
            </p>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Мои заказы</h1>

      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <button
            key={status.value || "all"}
            onClick={() => setActiveStatus(status.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeStatus === status.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <OrdersList
          orders={data?.orders?.edges || []}
          loading={loading}
          error={error}
          onLoadMore={handleLoadMore}
          hasNextPage={data?.orders?.pageInfo?.hasNextPage}
          variant="default"
        />
      </div>
    </div>
  );
}
