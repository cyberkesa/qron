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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

    if (!formData.firstName.trim()) {
      errors.firstName = "Имя обязательно для заполнения";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Фамилия обязательна для заполнения";
    }

    if (!formData.email.trim()) {
      errors.email = "Email обязателен для заполнения";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Введите корректный email";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Телефон обязателен для заполнения";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Введите телефон в формате +7 (999) 123-45-67";
    }

    if (!formData.password) {
      errors.password = "Пароль обязателен для заполнения";
    } else if (formData.password.length < 6) {
      errors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Подтверждение пароля обязательно";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают";
    }

    if (!selectedRegion) {
      errors.region = "Выберите регион";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setFormErrors({});

    if (!validateForm()) {
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
            regionId: selectedRegion?.id,
          },
        },
      });

      if (result.data?.register?.accessToken) {
        // Сохраняем токены в localStorage
        localStorage.setItem("accessToken", result.data.register.accessToken);
        localStorage.setItem("refreshToken", result.data.register.refreshToken);

        // Перенаправляем на главную страницу
        router.push("/");
      } else if (result.data?.register?.message) {
        setErrorMessage(result.data.register.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при регистрации";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Регистрация
        </h1>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start mb-6">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Ошибка регистрации
              </h3>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
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
                  className={`w-full px-4 py-2 border ${
                    formErrors.firstName ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.firstName}
                  </p>
                )}
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
                  className={`w-full px-4 py-2 border ${
                    formErrors.lastName ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.lastName}
                  </p>
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
                className={`w-full px-4 py-2 border ${
                  formErrors.email ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
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
                className={`w-full px-4 py-2 border ${
                  formErrors.phoneNumber ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                placeholder="+7 (999) 123-45-67"
              />
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.phoneNumber}
                </p>
              )}
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
                className={`w-full px-4 py-2 border ${
                  formErrors.password ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                minLength={6}
              />
              {formErrors.password ? (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Минимум 6 символов</p>
              )}
            </div>

            <div className="mb-4">
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
                className={`w-full px-4 py-2 border ${
                  formErrors.confirmPassword
                    ? "border-red-300"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Регион *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRegionsOpen(!regionsOpen)}
                  className={`w-full px-4 py-2 border ${
                    formErrors.region ? "border-red-300" : "border-gray-300"
                  } rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {selectedRegion ? selectedRegion.name : "Выберите регион"}
                </button>
                {formErrors.region && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.region}
                  </p>
                )}
                {regionsOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                    <ul className="max-h-60 overflow-auto">
                      {regionsData?.regions.map((region: Region) => (
                        <li
                          key={region.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleRegionSelect(region)}
                        >
                          {region.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
