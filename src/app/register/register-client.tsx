'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import {
  REGISTER,
  GET_REGIONS,
  REQUEST_EMAIL_ADDRESS_VERIFICATION,
} from '@/lib/queries';
import Link from 'next/link';
import {
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface Region {
  id: string;
  name: string;
}

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  // State for email verification
  const [verificationState, setVerificationState] = useState({
    emailAddressVerificationRequestId: searchParams?.get('requestId') || '',
    emailAddressVerificationCode: '',
  });

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
  const [successMessage, setSuccessMessage] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { loading }] = useMutation(REGISTER);
  const [requestVerification, { loading: verificationLoading }] = useMutation(
    REQUEST_EMAIL_ADDRESS_VERIFICATION
  );
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

    // Handle verification code input separately
    if (name === 'verificationCode') {
      setVerificationState({
        ...verificationState,
        emailAddressVerificationCode: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setRegionsOpen(false);
  };

  // Функция для отправки кода подтверждения
  const handleSendVerificationCode = async () => {
    // Очистить предыдущие сообщения
    setErrorMessage('');
    setSuccessMessage('');

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailAddress.trim()) {
      setFormErrors({
        ...formErrors,
        emailAddress: 'Email обязателен для заполнения',
      });
      return;
    } else if (!emailRegex.test(formData.emailAddress)) {
      setFormErrors({
        ...formErrors,
        emailAddress: 'Введите корректный email',
      });
      return;
    }

    try {
      const result = await requestVerification({
        variables: {
          emailAddress: formData.emailAddress,
        },
      });

      if (
        result.data?.requestEmailAddressVerification?.__typename ===
        'RequestEmailAddressVerificationSuccessResult'
      ) {
        // Запоминаем ID запроса подтверждения email
        setVerificationState({
          ...verificationState,
          emailAddressVerificationRequestId:
            result.data.requestEmailAddressVerification.requestId,
        });
        setSuccessMessage('Код подтверждения отправлен на ваш email');
        setCodeSent(true);
      } else if (
        result.data?.requestEmailAddressVerification?.__typename ===
        'RequestEmailAddressVerificationErrorDueToEmailAddressAlreadyTaken'
      ) {
        setErrorMessage('Этот email уже зарегистрирован в системе');
      } else if (result.data?.requestEmailAddressVerification?.message) {
        setErrorMessage(result.data.requestEmailAddressVerification.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при отправке кода подтверждения';
      setErrorMessage(errorMessage);
      console.error('Verification code request error:', error);
    }
  };

  // Правила для пароля
  const passwordRules = [
    { text: 'Минимум 6 символов', valid: formData.password.length >= 6 },
    {
      text: 'Содержит хотя бы одну букву',
      valid: /[a-zA-Z]/.test(formData.password),
    },
    {
      text: 'Содержит хотя бы одну цифру',
      valid: /[0-9]/.test(formData.password),
    },
  ];

  // Функция для проверки правильности email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно для заполнения';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.emailAddress.trim()) {
      errors.emailAddress = 'Email обязателен для заполнения';
    } else if (!isValidEmail(formData.emailAddress)) {
      errors.emailAddress = 'Введите корректный email';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен для заполнения';
    } else {
      if (formData.password.length < 6) {
        errors.password = 'Пароль должен содержать минимум 6 символов';
      }
      if (!/[a-zA-Z]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}, содержать хотя бы одну букву`
          : 'Пароль должен содержать хотя бы одну букву';
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}, содержать хотя бы одну цифру`
          : 'Пароль должен содержать хотя бы одну цифру';
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!selectedRegion) {
      errors.region = 'Выберите регион';
    }

    // Validate verification code
    if (!verificationState.emailAddressVerificationCode) {
      errors.verificationCode = 'Введите код подтверждения';
    }

    if (!verificationState.emailAddressVerificationRequestId) {
      errors.verificationRequestId =
        'Сначала запросите код подтверждения, нажав на кнопку "Отправить код"';
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
          name: formData.name,
          emailAddress: formData.emailAddress,
          password: formData.password,
          regionId: selectedRegion?.id,
          // Include verification fields from state
          emailAddressVerificationRequestId:
            verificationState.emailAddressVerificationRequestId,
          emailAddressVerificationCode:
            verificationState.emailAddressVerificationCode,
        },
      });

      if (result.data?.register?.__typename === 'RegisterSuccessResult') {
        // Redirect to login page after successful registration
        router.push(`/login?registered=true&redirect=${redirectTo}`);
      } else if (
        result.data?.register?.__typename ===
        'RegisterErrorDueToEmailAddressVerificationCodeExpired'
      ) {
        setErrorMessage(
          'Код подтверждения истек. Пожалуйста, запросите новый код.'
        );
      } else if (
        result.data?.register?.__typename ===
        'RegisterErrorDueToWrongEmailAddressVerificationCode'
      ) {
        setErrorMessage(
          'Неверный код подтверждения. Пожалуйста, проверьте код и попробуйте снова.'
        );
      } else if (
        result.data?.register?.__typename ===
        'RegisterErrorDueToEmailAddressVerificationCodeMaximumEnterAttemptsExceeded'
      ) {
        setErrorMessage(
          'Превышено максимальное количество попыток ввода кода. Пожалуйста, запросите новый код.'
        );
      } else if (result.data?.register?.message) {
        setErrorMessage(result.data.register.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при регистрации';
      setErrorMessage(errorMessage);
      console.error('Registration error:', error);
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
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
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
              <p className="mt-1 text-xs text-gray-500">
                Ваше имя будет отображаться в личном кабинете и заказах
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="emailAddress"
                className="block text-gray-700 font-medium mb-2"
              >
                Email *
              </label>
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className={`flex-grow pl-10 px-4 py-2 border ${
                    formErrors.emailAddress
                      ? 'border-red-300'
                      : isValidEmail(formData.emailAddress) &&
                          formData.emailAddress.length > 0
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300'
                  } rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {isValidEmail(formData.emailAddress) &&
                  formData.emailAddress.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={
                    verificationLoading ||
                    !formData.emailAddress ||
                    !isValidEmail(formData.emailAddress)
                  }
                  className={`px-4 py-2 flex items-center ${
                    codeSent
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded-r-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {verificationLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                    </div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                      {codeSent ? 'Отправить снова' : 'Отправить код'}
                    </>
                  )}
                </button>
              </div>
              {formErrors.emailAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.emailAddress}
                </p>
              )}
              <div className="mt-1 text-xs">
                <p className="text-gray-500">
                  На этот адрес будет отправлен код подтверждения
                </p>
                <p className="text-gray-500 mt-1">
                  Email также будет использоваться для входа в систему и
                  получения информации о заказах
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Пароль *
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
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  minLength={6}
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
              {formErrors.password ? (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
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
            </div>

            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Подтверждение пароля *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-10 py-2 border ${
                    formErrors.confirmPassword
                      ? 'border-red-300'
                      : formData.password === formData.confirmPassword &&
                          formData.confirmPassword.length > 0
                        ? 'border-green-300'
                        : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
                {formData.password === formData.confirmPassword &&
                  formData.confirmPassword.length > 0 && (
                    <div className="absolute inset-y-0 right-9 flex items-center pointer-events-none">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
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

            <div className="mb-5">
              <label
                htmlFor="verificationCode"
                className="block text-gray-700 font-medium mb-2"
              >
                Код подтверждения *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationState.emailAddressVerificationCode}
                  onChange={handleChange}
                  className={`w-full pl-10 px-4 py-2 border ${
                    formErrors.verificationCode
                      ? 'border-red-300'
                      : verificationState.emailAddressVerificationCode.length >
                          0
                        ? 'border-blue-300'
                        : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Введите код из письма"
                  required
                />
              </div>
              {formErrors.verificationCode && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.verificationCode}
                </p>
              )}
              {formErrors.verificationRequestId && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.verificationRequestId}
                </p>
              )}
              <div className="mt-1 text-xs">
                <p
                  className={
                    codeSent ? 'text-green-600 font-medium' : 'text-gray-500'
                  }
                >
                  {codeSent
                    ? 'Проверьте вашу почту и введите полученный код подтверждения'
                    : 'Отправьте код подтверждения на указанный выше email, нажав кнопку "Отправить код"'}
                </p>
                {codeSent && (
                  <p className="text-gray-500 mt-1">
                    Если письмо не&nbsp;пришло, проверьте папку
                    &laquo;Спам&raquo; или попробуйте отправить код снова
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="region"
                className="block text-gray-700 font-medium mb-2"
              >
                Регион *
              </label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full px-4 py-2 bg-white border ${
                    formErrors.region ? 'border-red-300' : 'border-gray-300'
                  } rounded-md text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  onClick={() => setRegionsOpen(!regionsOpen)}
                >
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>
                      {selectedRegion?.name || 'Выберите регион доставки'}
                    </span>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transform ${
                      regionsOpen ? 'rotate-180' : ''
                    } transition-transform`}
                    xmlns="http://www.w3.org/2000/svg"
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

                {regionsOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {regionsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Загрузка регионов...
                      </div>
                    ) : regionsData?.regions?.length > 0 ? (
                      regionsData.regions.map((region: Region) => (
                        <button
                          key={region.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                          onClick={() => handleRegionSelect(region)}
                        >
                          {region.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Регионы не найдены
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.region && (
                <p className="mt-1 text-sm text-red-600">{formErrors.region}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
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
                    Регистрация...
                  </div>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                href={`/login${
                  redirectTo !== '/' ? `?redirect=${redirectTo}` : ''
                }`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
