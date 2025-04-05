"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { REGISTER, GET_REGIONS } from "@/lib/queries";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface Region {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [register, { loading }] = useMutation(REGISTER);
  const { data: regionsData, loading: regionsLoading } = useQuery(GET_REGIONS);

  useEffect(() => {
    // Загружаем выбранный регион из localStorage
    const savedRegion = localStorage.getItem("selectedRegion");
    if (savedRegion) {
      setSelectedRegion(JSON.parse(savedRegion));
    } else if (regionsData?.regions && regionsData.regions.length > 0) {
      // Если регион не выбран, используем первый из списка
      setSelectedRegion(regionsData.regions[0]);
    }
  }, [regionsData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setRegionsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Пароли не совпадают");
      return;
    }

    if (!selectedRegion) {
      setErrorMessage("Выберите регион");
      return;
    }

    try {
      const result = await register({
        variables: {
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            regionId: selectedRegion.id,
          },
        },
      });

      if (result.data?.register?.accessToken) {
        // Сохраняем токены и регион в localStorage
        localStorage.setItem("accessToken", result.data.register.accessToken);
        localStorage.setItem("refreshToken", result.data.register.refreshToken);
        localStorage.setItem("selectedRegion", JSON.stringify(selectedRegion));

        // Перенаправляем на главную страницу
        router.push("/");
      } else if (result.data?.register?.message) {
        setErrorMessage(result.data.register.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Произошла ошибка при регистрации");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Регистрация
        </h1>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Имя *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Фамилия *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="region"
                className="block text-gray-700 font-medium mb-2"
              >
                Регион *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRegionsOpen(!regionsOpen)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-gray-500" />
                    {selectedRegion?.name || "Выберите регион"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      regionsOpen ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {regionsOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {regionsLoading ? (
                      <div className="px-4 py-2 text-gray-500">
                        Загрузка регионов...
                      </div>
                    ) : regionsData?.regions?.length > 0 ? (
                      regionsData.regions.map((region: Region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => handleRegionSelect(region)}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                            selectedRegion?.id === region.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {region.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        Нет доступных регионов
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Пароль *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-1">Минимум 6 символов</p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Подтверждение пароля *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
