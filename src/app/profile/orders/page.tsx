'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '@/lib/queries';
import { OrdersList } from '@/components/order/OrdersList';
import { FunnelIcon } from '@heroicons/react/24/outline';

export default function ProfileOrdersPage() {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    data,
    fetchMore,
    error: queryError,
  } = useQuery(GET_ORDERS, {
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
    onCompleted: () => setLoading(false),
    onError: () => setLoading(false),
  });

  const handleLoadMore = () => {
    if (data?.orders?.pageInfo?.hasNextPage) {
      setLoading(true);
      fetchMore({
        variables: {
          after: data.orders.pageInfo.endCursor,
        },
      });
    }
  };

  const handleStatusFilter = (status: string | null) => {
    setActiveStatus(status);
  };

  const statuses = [
    { value: null, label: 'Все' },
    { value: 'PENDING', label: 'Ожидает' },
    { value: 'PROCESSING', label: 'В обработке' },
    { value: 'SHIPPED', label: 'Отправлен' },
    { value: 'DELIVERED', label: 'Доставлен' },
    { value: 'CANCELLED', label: 'Отменен' },
  ];

  // Get filtered orders based on selected status
  const filteredOrders = (data?.orders?.edges || []).filter((edge: any) =>
    activeStatus ? edge.node.status === activeStatus : true
  );

  // Map the orders data to the format needed by OrdersList
  const ordersData = filteredOrders.map((edge: any) => edge.node);

  // Проверяем, есть ли данные для отображения
  const hasOrders = ordersData.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Мои заказы</h1>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Фильтр:</span>
          <div className="ml-4 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.value || 'all'}
                onClick={() => handleStatusFilter(status.value)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  activeStatus === status.value
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Отображаем таблицу только если есть заказы */}
      {hasOrders ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Номер заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Товары
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
              </tr>
            </thead>
            <OrdersList
              orders={ordersData}
              loading={loading}
              onLoadMore={handleLoadMore}
              hasNextPage={data?.orders?.pageInfo?.hasNextPage}
              variant="table"
              showEmptyState={false}
              error={queryError}
            />
          </table>
        </div>
      ) : loading ? (
        // Состояние загрузки вне таблицы
        <div className="bg-white shadow rounded-lg p-8">
          <div className="animate-shimmer space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ) : queryError ? (
        // Состояние ошибки вне таблицы
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-red-600 mb-2">
            Произошла ошибка при загрузке заказов
          </p>
          <p className="text-sm text-gray-600">{queryError.message}</p>
        </div>
      ) : (
        // Пустое состояние вне таблицы
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            {activeStatus
              ? 'Заказов с выбранным статусом не найдено'
              : 'У вас пока нет заказов'}
          </div>
          <a
            href="/catalog"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Перейти в каталог
          </a>
        </div>
      )}
    </div>
  );
}
