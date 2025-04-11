"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VIEWER, UPDATE_PROFILE } from "@/lib/queries";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);

  const { data, loading: dataLoading, error } = useQuery(GET_VIEWER);
  const [updateProfile] = useMutation(UPDATE_PROFILE, {
    onCompleted: (data) => {
      if (data.updateProfile.__typename === "UpdateProfileSuccessResult") {
        setMessage({
          text: "Профиль успешно обновлен",
          isError: false,
        });
        // Редирект на страницу профиля через 2 секунды
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setMessage({
          text: data.updateProfile.message || "Не удалось обновить профиль",
          isError: true,
        });
      }
      setLoading(false);
    },
    onError: (error) => {
      setMessage({
        text: error.message || "Произошла ошибка при обновлении профиля",
        isError: true,
      });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (data && data.viewer) {
      setFormData({
        name: data.viewer.name || "",
        phoneNumber: data.viewer.phoneNumber || "",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      await updateProfile({
        variables: {
          name: formData.name,
          phoneNumber: formData.phoneNumber || null,
        },
      });
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      setMessage({
        text: "Произошла ошибка при обновлении профиля",
        isError: true,
      });
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error.message || "Произошла ошибка при загрузке данных профиля"}
      </div>
    );
  }

  if (!data || !data.viewer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Необходимо авторизоваться для редактирования профиля
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Редактирование профиля
            </h1>
            <p className="text-gray-600 text-sm">
              Измените ваши персональные данные
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.isError
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-green-50 text-green-700 border border-green-100"
            }`}
          >
            {message.isError ? (
              <XCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="flex items-center text-gray-700 font-medium text-sm"
            >
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              placeholder="Введите ваше имя"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="flex items-center text-gray-700 font-medium text-sm"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={data.viewer.emailAddress}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-gray-500 bg-gray-200 rounded-md px-2 py-1">
                  Неизменяемое поле
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Email является вашим идентификатором и не может быть изменен
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="phoneNumber"
              className="flex items-center text-gray-700 font-medium text-sm"
            >
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
              Телефон
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <Link
              href="/profile"
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
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
