"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESSES, DELETE_DELIVERY_ADDRESS } from "@/lib/queries";
import { DeliveryAddress } from "@/types/api";
import Link from "next/link";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DeliveryAddressesPage() {
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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-blue-600">Загрузка адресов...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Мои адреса доставки
        </h2>
        <Link
          href="/profile/addresses/new"
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
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
                  <p className="text-gray-900 font-medium">
                    {address.fullName}
                  </p>
                  <p className="text-gray-700">{address.fullAddress}</p>
                  <p className="text-gray-500 text-sm">{address.phoneNumber}</p>
                  {address.isDefault && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                      Адрес по умолчанию
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/profile/addresses/edit/${address.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
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
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Добавить адрес
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
