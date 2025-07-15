'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { REGISTER, GET_REGIONS } from '@/lib/queries';
import Link from 'next/link';
import {
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import RegisterClient from './register-client';

interface Region {
  id: string;
  name: string;
}

// Loading component for Suspense fallback
function RegisterLoading() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Регистрация
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-shimmer">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="h-10 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main registration component that uses hooks requiring Suspense
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  const [formData, setFormData] = useState({
    name: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [register, { loading }] = useMutation(REGISTER);
  const { data: regionsData, loading: regionsLoading } = useQuery(GET_REGIONS);

  useEffect(() => {
    // Загружаем выбранный регион из localStorage
    const savedRegion = localStorage.getItem('selectedRegion');
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

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно для заполнения';
    }

    if (!formData.emailAddress.trim()) {
      errors.emailAddress = 'Email обязателен для заполнения';
    } else if (!emailRegex.test(formData.emailAddress)) {
      errors.emailAddress = 'Введите корректный email';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!selectedRegion) {
      errors.region = 'Выберите регион';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const result = await register({
        variables: {
          input: {
            name: formData.name,
            emailAddress: formData.emailAddress,
            password: formData.password,
            regionId: selectedRegion?.id,
          },
        },
      });

      if (result.data?.register?.__typename === 'RegisterSuccessResult') {
        // Показываем успешное сообщение и перенаправляем на страницу входа
        router.push(`/login?registered=true&redirect=${redirectTo}`);
      } else if (result.data?.register?.message) {
        setErrorMessage(result.data.register.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при регистрации';
      setErrorMessage(errorMessage);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
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
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Имя *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="emailAddress"
                className="block text-gray-700 font-medium mb-2"
              >
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.emailAddress
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {formErrors.emailAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.emailAddress}
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  minLength={6}
                />
              </div>
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.confirmPassword
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setRegionsOpen(!regionsOpen)}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.region ? 'border-red-300' : 'border-gray-300'
                  } rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex justify-between items-center`}
                >
                  <span
                    className={
                      selectedRegion ? 'text-gray-900' : 'text-gray-500'
                    }
                  >
                    {selectedRegion ? selectedRegion.name : 'Выберите регион'}
                  </span>
                  <svg
                    className={`h-5 w-5 text-gray-400 ${regionsOpen ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {formErrors.region && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.region}
                  </p>
                )}
                {regionsOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                    {regionsLoading ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        Загрузка регионов...
                      </div>
                    ) : (
                      <ul className="max-h-60 overflow-auto">
                        {regionsData?.regions.map((region: Region) => (
                          <li
                            key={region.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                            onClick={() => handleRegionSelect(region)}
                          >
                            {region.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Регистрация...
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                href={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Export the page component with Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterClient />
    </Suspense>
  );
}
