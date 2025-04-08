"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { CREATE_DELIVERY_ADDRESS } from "@/lib/queries";
import Link from "next/link";

export default function NewAddressPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [createAddress, { loading }] = useMutation(CREATE_DELIVERY_ADDRESS);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await createAddress({
        variables: {
          fullAddress: `${formData.fullName}, ${formData.phoneNumber}, ${formData.address}, ${formData.city}, ${formData.postalCode}`,
        },
      });

      if (result.data?.addDeliveryAddress?.deliveryAddress?.id) {
        router.push("/profile/addresses");
      } else if (result.data?.addDeliveryAddress?.message) {
        setErrorMessage(result.data.addDeliveryAddress.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при создании адреса";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/profile/addresses"
            className="text-blue-600 hover:text-blue-800 mr-4"
          >
            ← Назад к адресам
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Добавление адреса доставки
          </h1>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-2"
            >
              ФИО получателя *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-gray-700 font-medium mb-2"
            >
              Телефон *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-gray-700 font-medium mb-2"
            >
              Адрес *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ул. Примерная, д. 1, кв. 123"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="city"
                className="block text-gray-700 font-medium mb-2"
              >
                Город *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Москва"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-gray-700 font-medium mb-2"
              >
                Почтовый индекс *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">
                Сделать адресом по умолчанию
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/profile/addresses"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 mr-4"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
