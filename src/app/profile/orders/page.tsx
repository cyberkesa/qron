"use client";

import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "@/lib/queries";
import { Order, OrderStatus } from "@/types/api";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface OrderEdge {
  node: Order;
}

export default function OrdersPage() {
  const { data, loading, error } = useQuery(GET_ORDERS);
  const orders = data?.orders?.edges?.map((edge: OrderEdge) => edge.node) || [];
  const filteredOrders = orders;

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Ожидает обработки";
      case OrderStatus.PROCESSING:
        return "В обработке";
      case OrderStatus.SHIPPED:
        return "Отправлен";
      case OrderStatus.DELIVERED:
        return "Доставлен";
      case OrderStatus.CANCELLED:
        return "Отменен";
      default:
        return String(status);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Мои заказы</h1>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Мои заказы</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error.message || "Произошла ошибка при загрузке заказов"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Мои заказы</h1>
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">У вас пока нет заказов</p>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: Order) => (
            <Link
              href={`/orders/${order.id}`}
              key={order.id}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Заказ #{order.number}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.creationDatetime)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === OrderStatus.DELIVERED
                      ? "bg-green-100 text-green-800"
                      : order.status === OrderStatus.CANCELLED
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Товаров: {order.items.totalQuantity}</span>
                  <span>Сумма: {order.items.decimalTotalPrice} ₽</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Адрес доставки: {order.deliveryFullAddress}</p>
                  <p>Телефон: {order.phoneNumber}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
