"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import { OrdersList } from "@/components/order/OrdersList";

export default function ProfileOrdersPage() {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const { data, loading, fetchMore } = useQuery(GET_ORDERS, {
    variables: { first: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const handleLoadMore = () => {
    if (data?.orders?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.orders.pageInfo.endCursor,
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Мои заказы</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
            orders={data?.orders?.edges || []}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasNextPage={data?.orders?.pageInfo?.hasNextPage}
            variant="table"
          />
        </table>
      </div>
    </div>
  );
}
