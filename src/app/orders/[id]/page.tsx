"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "@/lib/queries";
import Link from "next/link";
<<<<<<< HEAD
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
=======
import Image from "next/image";
import { OrderItem, OrderStatus } from "@/types/api";
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c

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

<<<<<<< HEAD
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
=======
  // Отображение статуса заказа
  const getStatusLabel = (status: OrderStatus) => {
    if (!status)
      return { text: "Неизвестно", className: "bg-gray-100 text-gray-800" };

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
        return { text: "Доставлен", className: "bg-green-100 text-green-800" };
      case OrderStatus.CANCELLED:
        return { text: "Отменен", className: "bg-red-100 text-red-800" };
      default:
        return { text: String(status), className: "bg-gray-100 text-gray-800" };
    }
  };

  // Преобразование способа оплаты
  const getPaymentMethod = (method: string) => {
    if (!method) return "Не указан";

    switch (method) {
      case "CARD":
        return "Банковская карта";
      case "CASH":
        return "Наличные при получении";
      default:
        return method;
    }
  };

  // Преобразование способа доставки
  const getDeliveryMethod = (method: string) => {
    if (!method) return "Не указан";

    switch (method) {
      case "DELIVERY":
        return "Курьерская доставка";
      case "PICKUP":
        return "Самовывоз";
      default:
        return method;
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c
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

<<<<<<< HEAD
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
=======
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Информация о заказе
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Дата заказа</p>
              <p className="font-medium">
                {formatDate(order.creationDatetime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Сумма заказа</p>
              <p className="font-medium">{order.totalPrice} ₽</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Способ оплаты</p>
              <p className="font-medium">
                {getPaymentMethod(order.paymentMethod)}
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c
              </p>
              <p>
                <span className="text-gray-600">Дата создания:</span>{" "}
                {formatDate(order.creationDatetime)}
              </p>
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-6 border-b">
          Товары в заказе
        </h2>
        <div>
          {items.length === 0 ? (
            <p className="text-gray-600 p-6">Нет данных о товарах в заказе</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item: OrderItem) => (
                <li key={item.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {item.product?.images?.[0]?.url && (
                      <div className="flex-shrink-0 w-20 h-20 relative">
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Количество: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {item.decimalUnitPrice} ₽
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {(
                          parseFloat(item.decimalUnitPrice) * item.quantity
                        ).toFixed(2)}{" "}
                        ₽
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-900">Итого</span>
            <span className="text-base font-medium text-gray-900">
              {order.totalPrice} ₽
            </span>
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c
          </div>
        </div>
      </div>
    </div>
  );
}
