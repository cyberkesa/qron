"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import { OrdersList } from "@/components/order/OrdersList";
import { FunnelIcon } from "@heroicons/react/24/outline";

export default function ProfileOrdersPage() {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, fetchMore } = useQuery(GET_ORDERS, {
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
    { value: null, label: "Все" },
    { value: "PENDING", label: "Ожидает" },
    { value: "PROCESSING", label: "В обработке" },
    { value: "SHIPPED", label: "Отправлен" },
    { value: "DELIVERED", label: "Доставлен" },
    { value: "CANCELLED", label: "Отменен" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
            История заказов
          </h2>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-1 hidden sm:block" />
            {statuses.map((status) => (
              <button
                key={status.value || "all"}
                onClick={() => handleStatusFilter(status.value)}
                className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
                  activeStatus === status.value
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            orders={(data?.orders?.edges || []).filter((edge: any) =>
              activeStatus ? edge.node.status === activeStatus : true,
            )}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasNextPage={data?.orders?.pageInfo?.hasNextPage}
            variant="table"
          />
        </table>
      </div>

      {!data?.orders?.edges?.length && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">У вас пока нет заказов</div>
          <a href="/catalog" className="text-blue-600 hover:text-blue-800">
            Перейти в каталог
          </a>
        </div>
      )}
    </div>
  );
}
