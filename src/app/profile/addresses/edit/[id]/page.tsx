"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESS, EDIT_DELIVERY_ADDRESS } from "@/lib/queries";
import { DeliveryAddress } from "@/types/api";
import { use } from "react";

export default function EditAddressPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const id = use(Promise.resolve(params.id));

  const {
    loading,
    error: queryError,
    data,
  } = useQuery(GET_DELIVERY_ADDRESS, {
    variables: { id },
    onCompleted: (data) => {
      if (data?.deliveryAddress) {
        setFormData({
          fullName: data.deliveryAddress.fullName,
          phoneNumber: data.deliveryAddress.phoneNumber,
          address: data.deliveryAddress.address,
          city: data.deliveryAddress.city,
          postalCode: data.deliveryAddress.postalCode,
        });
      }
    },
  });

  const [editAddress] = useMutation(EDIT_DELIVERY_ADDRESS, {
    onCompleted: (data) => {
      if (data.editDeliveryAddress.__typename === "UnexpectedError") {
        setError(data.editDeliveryAddress.message);
      } else {
        setSuccess("Адрес успешно обновлен");
        setTimeout(() => {
          router.push("/profile/addresses");
        }, 2000);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await editAddress({
      variables: {
        id,
        fullAddress,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!data?.deliveryAddress) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">Адрес не найден</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Редактирование адреса
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Полный адрес
              </label>
              <textarea
                id="fullAddress"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/profile/addresses")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
