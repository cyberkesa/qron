"use client";

import { useQuery } from "@apollo/client";
import { GET_VIEWER, GET_ORDERS } from "@/lib/queries";
import Link from "next/link";
import { OrderStatus } from "@/types/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { data } = useQuery(GET_VIEWER);
  const { data: ordersData } = useQuery(GET_ORDERS, {
    variables: {
      first: 100,
    },
  });

  // Calculate order statistics
  const orders =
    ordersData?.orders?.edges?.map((edge: { node: any }) => edge.node) || [];
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order: { status: OrderStatus }) =>
    [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(
      order.status,
    ),
  ).length;

  const user = data?.viewer;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Личные данные</h2>
          <Link
            href="/profile/edit"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4 mr-1" />
            <span>Редактировать</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <div className="text-sm text-gray-500 mb-1">Имя</div>
            <div className="font-medium text-gray-900">{user?.name || "—"}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-medium text-gray-900">
              {user?.emailAddress || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Телефон</div>
            <div className="font-medium text-gray-900">
              {user?.phoneNumber || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Регион</div>
            <div className="font-medium text-gray-900">
              {user?.region?.name || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Order statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {totalOrders}
          </div>
          <div className="text-gray-500">Всего заказов</div>
          <Link
            href="/profile/orders"
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Перейти к списку заказов →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md flex flex-col items-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {activeOrders}
          </div>
          <div className="text-gray-500">Активных заказов</div>
          {activeOrders > 0 && (
            <Link
              href="/profile/orders"
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              Отслеживать заказы →
            </Link>
          )}
        </div>
      </div>

      {/* Addresses section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-300 hover:shadow-md mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Адреса доставки
          </h2>
          <Link
            href="/profile/addresses"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Управление адресами
          </Link>
        </div>

        <div className="text-center py-4">
          <Link
            href="/profile/addresses"
            className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
          >
            Перейти к моим адресам
          </Link>
        </div>
      </div>
    </>
  );
}
