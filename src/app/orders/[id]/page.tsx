"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "@/lib/queries";
import Link from "next/link";
import Image from "next/image";
import { OrderItem, OrderStatus } from "@/types/api";

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

  const order = data?.order;

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
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
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о заказе...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Назад к заказам
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Заказ #{id}</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error.message || "Произошла ошибка при загрузке заказа"}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/orders"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Назад к заказам
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Заказ #{id}</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          Заказ не найден
        </div>
      </div>
    );
  }

  const status = getStatusLabel(order.status);
  const items = order.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/orders"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Назад к заказам
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Заказ #{order.id}</h1>
        <div className="mt-2 md:mt-0">
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${status.className}`}
          >
            {status.text}
          </span>
        </div>
      </div>

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
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Способ доставки</p>
              <p className="font-medium">
                {getDeliveryMethod(order.deliveryMethod)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Адрес доставки
          </h2>
          {order.deliveryAddress ? (
            <div className="space-y-3">
              <div>
                <p className="font-medium">{order.deliveryAddress.fullName}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-600">{order.deliveryAddress.address}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.postalCode}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Информация об адресе недоступна</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            История заказа
          </h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Заказ размещен
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            {order.status !== "PENDING" && (
              <div className="flex">
                <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Заказ принят
                  </p>
                  <p className="text-sm text-gray-500">
                    Заказ передан в обработку
                  </p>
                </div>
              </div>
            )}
            {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
              <div className="flex">
                <div className="flex-shrink-0 h-4 w-4 rounded-full bg-purple-500 mt-1"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Заказ отправлен
                  </p>
                  <p className="text-sm text-gray-500">
                    Ваш заказ передан в доставку
                  </p>
                </div>
              </div>
            )}
            {order.status === "DELIVERED" && (
              <div className="flex">
                <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Заказ доставлен
                  </p>
                  <p className="text-sm text-gray-500">
                    Ваш заказ успешно доставлен
                  </p>
                </div>
              </div>
            )}
            {order.status === "CANCELLED" && (
              <div className="flex">
                <div className="flex-shrink-0 h-4 w-4 rounded-full bg-red-500 mt-1"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Заказ отменен
                  </p>
                  <p className="text-sm text-gray-500">Ваш заказ был отменен</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
