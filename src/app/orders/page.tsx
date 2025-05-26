'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ORDERS } from '@/lib/queries';
import { OrdersList } from '@/components/order/OrdersList';
import { OrderStatus } from '@/types/api';
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

type StatusOption = {
  value: OrderStatus | null;
  label: string;
  count?: number;
  color: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: null, label: 'Все', color: 'blue' },
  { value: OrderStatus.PENDING, label: 'Ожидает обработки', color: 'yellow' },
  { value: OrderStatus.PROCESSING, label: 'В обработке', color: 'blue' },
  { value: OrderStatus.SHIPPED, label: 'Отправлен', color: 'purple' },
  { value: OrderStatus.DELIVERED, label: 'Доставлен', color: 'green' },
  { value: OrderStatus.CANCELLED, label: 'Отменен', color: 'red' },
];

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
    if (!loading && data?.orders?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.orders.pageInfo.endCursor,
          status: activeStatus,
        },
      });
    }
  };

  const getStatusButtonClass = (status: StatusOption, isActive: boolean) => {
    const baseClass =
      'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 border';

    if (isActive) {
      const colorClasses = {
        blue: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25',
        yellow:
          'bg-yellow-600 text-white border-yellow-600 shadow-lg shadow-yellow-600/25',
        purple:
          'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/25',
        green:
          'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/25',
        red: 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/25',
      };
      return `${baseClass} ${colorClasses[status.color as keyof typeof colorClasses]}`;
    }

    return `${baseClass} bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm`;
  };

  const totalOrders = data?.orders?.edges?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Мои заказы
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            История ваших заказов и текущий статус доставки
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
            {totalOrders > 0 && (
              <span className="ml-auto bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Найдено: {totalOrders}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value || 'all'}
                onClick={() => setActiveStatus(status.value)}
                className={getStatusButtonClass(
                  status,
                  activeStatus === status.value
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <OrdersList
            orders={(data?.orders?.edges || []).map(
              (edge: { node: any }) => edge.node
            )}
            loading={loading}
            error={error}
            onLoadMore={handleLoadMore}
            hasNextPage={data?.orders?.pageInfo?.hasNextPage}
            variant="default"
          />
        </div>
      </main>
    </div>
  );
}
