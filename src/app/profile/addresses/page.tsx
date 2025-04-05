"use client";

import { useQuery, useMutation } from "@apollo/client";
import {
  GET_DELIVERY_ADDRESSES,
  DELETE_DELIVERY_ADDRESS,
  SET_DEFAULT_DELIVERY_ADDRESS,
} from "@/lib/queries";
import Link from "next/link";
import { useState } from "react";
import {
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function DeliveryAddressesPage() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_DELIVERY_ADDRESSES);
  const [deleteAddress] = useMutation(DELETE_DELIVERY_ADDRESS);
  const [setDefaultAddress] = useMutation(SET_DEFAULT_DELIVERY_ADDRESS);

  const addresses = data?.deliveryAddresses || [];

  const handleDelete = async (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteMessage("");
    setIsDeleting(true);

    try {
      const result = await deleteAddress({
        variables: {
          id,
        },
      });

      if (result.data?.deleteDeliveryAddress?.success) {
        setSuccessMessage("Адрес успешно удален");
        refetch();
      } else if (result.data?.deleteDeliveryAddress?.message) {
        setDeleteMessage(result.data.deleteDeliveryAddress.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Произошла ошибка при удалении адреса");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await setDefaultAddress({
        variables: {
          id,
        },
      });

      if (result.data?.setDefaultDeliveryAddress?.success) {
        setSuccessMessage("Адрес по умолчанию успешно изменен");
        refetch();
      } else if (result.data?.setDefaultDeliveryAddress?.message) {
        setErrorMessage(result.data.setDefaultDeliveryAddress.message);
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "Произошла ошибка при установке адреса по умолчанию"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка адресов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Адреса доставки</h1>
        <Link
          href="/profile/addresses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Добавить новый адрес
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {deleteMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {deleteMessage}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            У вас еще нет сохраненных адресов доставки
          </p>
          <Link
            href="/profile/addresses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Добавить адрес
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address: any) => (
            <div
              key={address.id}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  По умолчанию
                </span>
              )}
              <h2 className="font-semibold text-lg">{address.fullName}</h2>
              <p className="text-gray-600 mt-1">{address.address}</p>
              <p className="text-gray-600">
                {address.city}, {address.postalCode}
              </p>
              <p className="text-gray-600 mb-4">{address.phoneNumber}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href={`/profile/addresses/edit/${address.id}`}
                  className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Редактировать
                </Link>

                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={isDeleting}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  Удалить
                </button>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    Сделать основным
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
