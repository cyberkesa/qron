"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "@/lib/queries";
import Link from "next/link";
import { OrderItem } from "@/types/api";
import { formatDate } from "@/lib/utils";

interface Order {
  id: string;
  number: string;
  status: string;
  creationDatetime: string;
  items: {
    edges: Array<{
      node: OrderItem;
    }>;
    decimalTotalPrice: string;
  };
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Извлекаем id из params с помощью React.use()
  const { id } = React.use(params);

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id },
  });

  const order = data?.order as Order | undefined;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 2,
    }).format(parseFloat(price));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CREATED":
        return "Создан";
      case "PAID":
        return "Оплачен";
      case "DELIVERED":
        return "Доставлен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Детали заказа</h1>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Детали заказа</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Произошла ошибка при загрузке заказа. Пожалуйста, попробуйте позже.
        </div>
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Вернуться к списку заказов
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Детали заказа</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Заказ не найден
        </div>
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Вернуться к списку заказов
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/orders" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Назад к заказам
        </Link>
        <h1 className="text-2xl font-bold">Заказ #{order.number}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Информация о заказе</h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Статус:</span>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {getStatusText(order.status)}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Дата создания:</span>{" "}
                {formatDate(order.creationDatetime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Товары в заказе</h2>
        <div className="space-y-4">
          {order.items.edges.map(({ node: item }) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} шт. × {formatPrice(item.decimalUnitPrice)}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(
                  (
                    parseFloat(item.decimalUnitPrice) * item.quantity
                  ).toString(),
                )}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="font-semibold">Итого</p>
            <p className="font-semibold text-lg">
              {formatPrice(order.items.decimalTotalPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
