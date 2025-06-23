'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN, GET_CART } from '@/lib/queries';
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
  const emailInputRef = useRef<HTMLInputElement>(null);
  const apolloClient = useApolloClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { loading }] = useMutation(LOGIN);

  // Автофокус на email поле при загрузке
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

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
        // Сохраняем токены в localStorage
        localStorage.setItem('accessToken', result.data.logIn.accessToken);
        localStorage.setItem('refreshToken', result.data.logIn.refreshToken);

        // Важно: не выполняем проверку региона при входе
        // Удаляем гостевой токен, чтобы избежать конфликтов
        localStorage.removeItem('guestToken');

        // Регион пользователя будет загружен автоматически после входа,
        // нам не нужно обновлять регион вручную

        // Принудительно обновляем данные перед редиректом
        try {
          await apolloClient.resetStore();
        } catch (refreshError) {
          console.error('Ошибка при обновлении данных:', refreshError);
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
    <div className="w-full max-w-md mx-auto px-3 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
        Вход в аккаунт
      </h1>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-1 sm:mb-1.5 text-sm sm:text-base"
            >
              Email
            </label>
            <div className="relative">
              <div className="input-icon-left">
                <EnvelopeIcon className="input-icon" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                ref={emailInputRef}
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.ru"
                className={`w-full input-with-icon-left py-2 sm:py-2.5 border ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                autoComplete="email"
                required
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-1 sm:mb-1.5 text-sm sm:text-base"
            >
              Пароль
            </label>
            <div className="relative">
              <div className="input-icon-left">
                <LockClosedIcon className="input-icon" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                className={`w-full input-with-icons-both py-2 sm:py-2.5 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                className="input-icon-right text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon
                    className="input-icon"
                    aria-hidden="true"
                  />
                ) : (
                  <EyeIcon
                    className="input-icon"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                {formErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm sm:text-base font-medium mt-2"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 sm:mt-5 flex flex-col space-y-2 sm:space-y-3">
          <div className="flex flex-wrap justify-center items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">
              Еще нет аккаунта?
            </span>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
            >
              Зарегистрироваться
            </Link>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">
              Забыли пароль?
            </span>
            <Link
              href="/reset-password"
              className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
            >
              Восстановить пароль
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
