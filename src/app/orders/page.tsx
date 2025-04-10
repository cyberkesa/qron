"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import { OrdersList } from "@/components/order/OrdersList";
import { OrderStatus } from "@/types/api";

type StatusOption = {
  value: OrderStatus | null;
  label: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: null, label: "Все" },
  { value: OrderStatus.PENDING, label: "Ожидает обработки" },
  { value: OrderStatus.PROCESSING, label: "В обработке" },
  { value: OrderStatus.SHIPPED, label: "Отправлен" },
  { value: OrderStatus.DELIVERED, label: "Доставлен" },
  { value: OrderStatus.CANCELLED, label: "Отменен" },
];

const ACTIVE_BUTTON_STYLE = "bg-blue-600 text-white";
const INACTIVE_BUTTON_STYLE = "bg-gray-100 text-gray-700 hover:bg-gray-200";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Мои заказы</h1>

      <div role="tablist" className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value || "all"}
            role="tab"
            aria-selected={activeStatus === status.value}
            onClick={() => setActiveStatus(status.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeStatus === status.value
                ? ACTIVE_BUTTON_STYLE
                : INACTIVE_BUTTON_STYLE
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
