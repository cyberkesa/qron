'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET, RESET_PASSWORD } from '@/lib/queries';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  // Состояние шага формы (1 - запрос кода, 2 - ввод кода и нового пароля)
  const [formStep, setFormStep] = useState(1);

  // Состояние данных формы
  const [emailAddress, setEmailAddress] = useState('');
  const [resetState, setResetState] = useState({
    passwordResetRequestId: searchParams?.get('requestId') || '',
    passwordResetCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Состояния ошибок, сообщений и загрузки
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Мутации для запроса сброса пароля и установки нового пароля
  const [requestReset, { loading: requestLoading }] = useMutation(
    REQUEST_PASSWORD_RESET
  );
  const [resetPassword, { loading: resetLoading }] =
    useMutation(RESET_PASSWORD);

  // Добавляем новые состояния для кнопок показа/скрытия пароля
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Правила для пароля
  const passwordRules = [
    { text: 'Минимум 6 символов', valid: resetState.newPassword.length >= 6 },
    {
      text: 'Содержит хотя бы одну букву',
      valid: /[a-zA-Z]/.test(resetState.newPassword),
    },
    {
      text: 'Содержит хотя бы одну цифру',
      valid: /[0-9]/.test(resetState.newPassword),
    },
  ];

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'emailAddress') {
      setEmailAddress(value);
    } else {
      setResetState({
        ...resetState,
        [name]: value,
      });
    }
  };

  // Функция для запроса кода сброса пароля
  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Очистить предыдущие сообщения
    setErrorMessage('');
    setSuccessMessage('');
    setFormErrors({});

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailAddress.trim()) {
      setFormErrors({
        ...formErrors,
        emailAddress: 'Email обязателен для заполнения',
      });
      return;
    } else if (!emailRegex.test(emailAddress)) {
      setFormErrors({
        ...formErrors,
        emailAddress: 'Введите корректный email',
      });
      return;
    }

    try {
      const result = await requestReset({
        variables: {
          emailAddress,
        },
      });

      if (
        result.data?.requestPasswordReset?.__typename ===
        'RequestPasswordResetSuccessResult'
      ) {
        // Сохраняем ID запроса сброса пароля
        setResetState({
          ...resetState,
          passwordResetRequestId: result.data.requestPasswordReset.requestId,
        });
        setSuccessMessage('Код подтверждения отправлен на ваш email');
        setCodeSent(true);
        // Переходим ко второму шагу формы
        setFormStep(2);
      } else if (
        result.data?.requestPasswordReset?.__typename ===
        'RequestPasswordResetErrorDueToAccountNotFound'
      ) {
        setErrorMessage('Аккаунт с таким email не найден');
      } else if (result.data?.requestPasswordReset?.message) {
        setErrorMessage(result.data.requestPasswordReset.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при отправке запроса на сброс пароля';
      setErrorMessage(errorMessage);
      console.error('Password reset request error:', error);
    }
  };

  // Функция для проверки правильности email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Обновляем validateResetForm с учетом новых требований к паролю
  const validateResetForm = () => {
    const errors: Record<string, string> = {};

    if (!resetState.passwordResetCode) {
      errors.passwordResetCode = 'Введите код подтверждения';
    }

    if (!resetState.newPassword) {
      errors.newPassword = 'Введите новый пароль';
    } else {
      if (resetState.newPassword.length < 6) {
        errors.newPassword = 'Пароль должен содержать минимум 6 символов';
      }
      if (!/[a-zA-Z]/.test(resetState.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}, содержать хотя бы одну букву`
          : 'Пароль должен содержать хотя бы одну букву';
      }
      if (!/[0-9]/.test(resetState.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}, содержать хотя бы одну цифру`
          : 'Пароль должен содержать хотя бы одну цифру';
      }
    }

    if (!resetState.confirmPassword) {
      errors.confirmPassword = 'Подтвердите новый пароль';
    } else if (resetState.newPassword !== resetState.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!resetState.passwordResetRequestId) {
      errors.passwordResetRequestId =
        'Отсутствует идентификатор запроса сброса пароля';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Функция для установки нового пароля
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFormErrors({});

    if (!validateResetForm()) {
      return;
    }

    try {
      const result = await resetPassword({
        variables: {
          passwordResetRequestId: resetState.passwordResetRequestId,
          passwordResetCode: resetState.passwordResetCode,
          newPassword: resetState.newPassword,
          emailAddress: emailAddress,
        },
      });

      if (
        result.data?.resetPassword?.__typename === 'ResetPasswordSuccessResult'
      ) {
        // Успешная смена пароля, перенаправляем на страницу входа
        router.push(`/login?passwordReset=true&redirect=${redirectTo}`);
      } else if (
        result.data?.resetPassword?.__typename ===
        'ResetPasswordErrorDueToPasswordResetCodeExpired'
      ) {
        setErrorMessage(
          'Код подтверждения истек. Пожалуйста, запросите новый код.'
        );
        setFormStep(1); // Возвращаемся к первому шагу
      } else if (
        result.data?.resetPassword?.__typename ===
        'ResetPasswordErrorDueToWrongPasswordResetCode'
      ) {
        setErrorMessage(
          'Неверный код подтверждения. Пожалуйста, проверьте код и попробуйте снова.'
        );
      } else if (
        result.data?.resetPassword?.__typename ===
        'ResetPasswordErrorDueToPasswordResetCodeAlreadyUsed'
      ) {
        setErrorMessage(
          'Этот код уже был использован. Пожалуйста, запросите новый код.'
        );
        setFormStep(1); // Возвращаемся к первому шагу
      } else if (
        result.data?.resetPassword?.__typename ===
        'ResetPasswordErrorDueToPasswordResetCodeMaximumEnterAttemptsExceeded'
      ) {
        setErrorMessage(
          'Превышено максимальное количество попыток. Пожалуйста, запросите новый код.'
        );
        setFormStep(1); // Возвращаемся к первому шагу
      } else if (result.data?.resetPassword?.message) {
        setErrorMessage(result.data.resetPassword.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при сбросе пароля';
      setErrorMessage(errorMessage);
      console.error('Password reset error:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Восстановление пароля
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
                Ошибка восстановления пароля
              </h3>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start mb-6">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Успешно</h3>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          {formStep === 1 ? (
            <form onSubmit={handleRequestReset}>
              <div className="mb-6">
                <label
                  htmlFor="emailAddress"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email *
                </label>
                <div className="input-icon-left">
                  <EnvelopeIcon className="input-icon" />
                </div>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={emailAddress}
                  onChange={handleChange}
                  className={`w-full input-with-icon-left py-2 sm:py-2.5 border ${
                    formErrors.emailAddress ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                  required
                />
                {formErrors.emailAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.emailAddress}
                  </p>
                )}
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Введите email, указанный при регистрации
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    На этот адрес будет отправлен код для сброса пароля
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={requestLoading || !isValidEmail(emailAddress)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Отправка...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Отправить код подтверждения
                    </div>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label
                  htmlFor="passwordResetCode"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Код подтверждения *
                </label>
                <div className="input-icon-left">
                  <CheckCircleIcon className="input-icon" />
                </div>
                <input
                  type="text"
                  id="passwordResetCode"
                  name="passwordResetCode"
                  value={resetState.passwordResetCode}
                  onChange={handleChange}
                  className={`w-full input-with-icons-both py-2 sm:py-2.5 border ${
                    formErrors.passwordResetCode ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                  placeholder="Введите код из письма"
                  required
                />
                {formErrors.passwordResetCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.passwordResetCode}
                  </p>
                )}
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Проверьте вашу почту и введите полученный код
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Если письмо не&nbsp;пришло, проверьте папку
                    &laquo;Спам&raquo; или вернитесь назад и&nbsp;запросите
                    новый код
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Новый пароль *
                </label>
                <div className="input-icon-left">
                  <LockClosedIcon className="input-icon" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={resetState.newPassword}
                  onChange={handleChange}
                  className={`w-full input-with-icons-both py-2 sm:py-2.5 border ${
                    formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="input-icon-right text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="input-icon" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="input-icon" aria-hidden="true" />
                  )}
                </button>
              </div>
              {formErrors.newPassword ? (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.newPassword}
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    Требования к паролю:
                  </p>
                  <ul className="text-xs space-y-1">
                    {passwordRules.map((rule, index) => (
                      <li key={index} className="flex items-center">
                        {rule.valid ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                        )}
                        <span
                          className={
                            rule.valid ? 'text-green-700' : 'text-gray-500'
                          }
                        >
                          {rule.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Подтверждение пароля *
                </label>
                <div className="relative">
                  <div className="input-icon-left">
                    <LockClosedIcon className="input-icon" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={resetState.confirmPassword}
                    onChange={handleChange}
                    className={`w-full input-with-icons-both py-2 sm:py-2.5 border ${
                      formErrors.confirmPassword
                        ? 'border-red-500'
                        : resetState.newPassword === resetState.confirmPassword &&
                          resetState.confirmPassword.length > 0
                        ? 'border-green-300'
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-right text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="input-icon" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="input-icon" aria-hidden="true" />
                    )}
                  </button>
                  {resetState.newPassword === resetState.confirmPassword &&
                    resetState.confirmPassword.length > 0 && (
                      <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Повторите ввод пароля для подтверждения
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setFormStep(1);
                    setFormErrors({});
                    setErrorMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                >
                  Вернуться назад
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Сброс пароля...' : 'Сбросить пароль'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            Вернуться на страницу входа
          </Link>
        </div>
      </div>
    </main>
  );
}
