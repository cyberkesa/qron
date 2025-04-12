'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LOGIN } from '@/lib/queries';
import Link from 'next/link';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { loading }] = useMutation(LOGIN);

  // Check password reset status from URL parameters
  useEffect(() => {
    if (searchParams?.get('passwordReset') === 'true') {
      setSuccessMessage(
        'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'
      );
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен для заполнения';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Введите корректный email';
      }
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен для заполнения';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (result.data?.logIn?.accessToken) {
        // Получаем текущий выбранный регион
        const selectedRegion = localStorage.getItem('selectedRegion');
        const regionObj = selectedRegion ? JSON.parse(selectedRegion) : null;

        // Сохраняем токены в localStorage
        localStorage.setItem('accessToken', result.data.logIn.accessToken);
        localStorage.setItem('refreshToken', result.data.logIn.refreshToken);

        // Помечаем текущий регион как регион токена
        if (regionObj && regionObj.id) {
          console.log('Вход выполнен, сохраняем регион токена:', regionObj.id);
          localStorage.setItem('tokenRegionId', regionObj.id);
        }

        // Перенаправляем на запрошенную страницу или домашнюю страницу
        router.push(redirectTo);
      } else if (result.data?.logIn?.message) {
        setErrorMessage(result.data.logIn.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Произошла ошибка при входе';
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Вход в аккаунт
      </h1>

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

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-9 py-2 border ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Пароль
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-9 pr-10 py-2 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Еще нет аккаунта?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800"
            >
              Зарегистрироваться
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Забыли пароль?{' '}
            <Link
              href="/reset-password"
              className="text-blue-600 hover:text-blue-800"
            >
              Восстановить пароль
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
