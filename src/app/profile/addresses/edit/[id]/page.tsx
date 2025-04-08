"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESS, EDIT_DELIVERY_ADDRESS } from "@/lib/queries";

export default function EditAddressPage() {
=======
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESS, EDIT_DELIVERY_ADDRESS } from "@/lib/queries";
import { use } from "react";

export default function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState("");

<<<<<<< HEAD
  // Get ID from params and decode it if it's base64 encoded
  const id = params?.id ? decodeURIComponent(params.id as string) : null;
=======
  const id = use(params).id;
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c

  const { loading, data } = useQuery(GET_DELIVERY_ADDRESS, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      if (data?.deliveryAddress?.fullAddress) {
        setFullAddress(data.deliveryAddress.fullAddress);
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
    if (!id) {
      setError("ID адреса не найден");
      return;
    }
    try {
      await editAddress({
        variables: {
          id,
          fullAddress,
        },
      });
    } catch (error) {
      setError("Ошибка при обновлении адреса");
    }
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

  if (queryError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            Ошибка загрузки адреса: {queryError.message}
          </div>
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
