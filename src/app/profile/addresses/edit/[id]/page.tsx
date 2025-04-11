"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DELIVERY_ADDRESS, EDIT_DELIVERY_ADDRESS } from "@/lib/queries";
import {
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullAddress, setFullAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get ID from params and decode it if it's base64 encoded
  const id = params?.id ? decodeURIComponent(params.id as string) : null;

  const {
    loading,
    error: queryError,
    data,
  } = useQuery(GET_DELIVERY_ADDRESS, {
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
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError("ID адреса не найден");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await editAddress({
        variables: {
          id,
          fullAddress,
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      setError("Ошибка при обновлении адреса");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Ошибка загрузки адреса: {queryError.message}
      </div>
    );
  }

  if (!data?.deliveryAddress) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Адрес не найден
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <MapPinIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Редактирование адреса
            </h1>
            <p className="text-gray-600 text-sm">
              Обновите информацию о вашем адресе доставки
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Link
          href="/profile/addresses"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Назад к списку адресов
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center">
            <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="fullAddress"
              className="flex items-center text-gray-700 font-medium text-sm"
            >
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
              Полный адрес
            </label>
            <textarea
              id="fullAddress"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={5}
              required
              placeholder="Введите полный адрес доставки"
            />
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Укажите полный адрес, включая город, улицу, дом, квартиру и индекс
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <Link
              href="/profile/addresses"
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Сохранение...
                </span>
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
