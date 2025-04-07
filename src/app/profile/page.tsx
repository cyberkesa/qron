"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_VIEWER, LOGOUT } from "@/lib/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [logoutMessage, setLogoutMessage] = useState("");

  const { data, loading, error } = useQuery(GET_VIEWER);
  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT);

  const handleLogout = async () => {
    try {
      const result = await logout();

      if (result.data?.logOut?.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("selectedRegion");
        setLogoutMessage("Вы успешно вышли из аккаунта. Перенаправление...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else if (result.data?.logOut?.message) {
        setLogoutMessage(`Ошибка: ${result.data.logOut.message}`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      setLogoutMessage(`Ошибка: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Профиль</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error.message || "Произошла ошибка при загрузке профиля"}
        </div>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  const user = data?.viewer;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Профиль</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          Вы не авторизованы
        </div>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Профиль</h1>

      {logoutMessage && (
        <div
          className={`px-4 py-3 rounded mb-6 ${
            logoutMessage.startsWith("Ошибка:")
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
        >
          {logoutMessage}
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
                  href="/orders"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/addresses"
                  className="text-blue-600 hover:text-blue-800 block py-2 border-b border-gray-100"
                >
                  Адреса доставки
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="text-red-600 hover:text-red-800 block py-2 w-full text-left"
                >
                  {logoutLoading ? "Выход..." : "Выйти из аккаунта"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Личные данные
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Имя</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Регион</p>
                  <p className="font-medium">{user.region?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.emailAddress}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <p className="font-medium">{user.phoneNumber || "Не указан"}</p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/profile/edit"
                className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Редактировать профиль
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold text-blue-700">0</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Активных заказов</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
