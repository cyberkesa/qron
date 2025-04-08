"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESSES, DELETE_DELIVERY_ADDRESS } from "@/lib/queries";
import { DeliveryAddress } from "@/types/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DeliveryAddressesPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_DELIVERY_ADDRESSES);

  const [deleteAddress] = useMutation(DELETE_DELIVERY_ADDRESS, {
    onCompleted: (data) => {
      if (data.deleteDeliveryAddress.__typename === "UnexpectedError") {
        setError(data.deleteDeliveryAddress.message);
      } else {
        setSuccess("Адрес успешно удален");
        refetch();
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот адрес?")) {
      await deleteAddress({
        variables: { id },
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка адресов доставки...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link
          href="/profile"
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          ← Назад в профиль
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Адреса доставки</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Навигация
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Личные данные
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/addresses"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100 font-medium"
                >
                  Адреса доставки
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Мои адреса доставки
              </h2>
              <Link
                href="/profile/addresses/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Добавить адрес
              </Link>
            </div>

            <div className="space-y-4">
              {data?.deliveryAddresses && data.deliveryAddresses.length > 0 ? (
                data.deliveryAddresses.map((address: DeliveryAddress) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="mb-3 md:mb-0">
                        <p className="text-gray-900">{address.fullAddress}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/profile/addresses/edit/${address.id}`}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
                        >
                          Редактировать
                        </Link>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">
                    У вас пока нет сохраненных адресов доставки
                  </p>
                  <Link
                    href="/profile/addresses/new"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Добавить адрес
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
