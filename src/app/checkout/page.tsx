'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CART,
  GET_DELIVERY_ADDRESSES,
  CHECK_OUT,
  GET_VIEWER,
} from '@/lib/queries';
import { DeliveryAddress, CartItem } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCartIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { trackOrder } from '@/lib/analytics';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Функция для форматирования цены
const formatPrice = (price: string) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(price));
};

// Функция для форматирования номера телефона
const formatPhoneNumber = (value: string) => {
  // Если первый введенный символ - это 8, сразу преобразуем в +7
  if (value.trim() === '8') {
    return '+7';
  }

  // Удаляем все нецифровые символы
  let phoneNumber = value.replace(/\D/g, '');

  // Проверяем формат номера
  if (phoneNumber.length === 0) {
    return '';
  }

  // Если номер начинается с 8, меняем на 7
  if (phoneNumber.startsWith('8')) {
    phoneNumber = '7' + phoneNumber.substring(1);
  }

  // Если номер не начинается с 7, добавляем 7 в начало
  if (!phoneNumber.startsWith('7') && phoneNumber.length > 0) {
    phoneNumber = '7' + phoneNumber;
  }

  // Ограничиваем длину до 11 цифр (с 7 в начале)
  phoneNumber = phoneNumber.substring(0, 11);

  // Форматируем номер в виде +7 (XXX) XXX-XX-XX
  let formattedNumber = '';

  // Всегда добавляем +7 в начало, если есть хотя бы одна цифра
  if (phoneNumber.length > 0) {
    formattedNumber = '+7';
  }

  // Добавляем код региона в скобках, только если есть цифры после 7
  if (phoneNumber.length > 1) {
    formattedNumber +=
      ' (' + phoneNumber.substring(1, Math.min(4, phoneNumber.length));

    // Закрываем скобку только если введены все цифры кода региона
    if (phoneNumber.length >= 4) {
      formattedNumber += ')';
    }
  }

  // Добавляем первую часть номера
  if (phoneNumber.length > 4) {
    formattedNumber +=
      ' ' + phoneNumber.substring(4, Math.min(7, phoneNumber.length));
  }

  // Добавляем вторую часть номера с дефисом
  if (phoneNumber.length > 7) {
    formattedNumber +=
      '-' + phoneNumber.substring(7, Math.min(9, phoneNumber.length));
  }

  // Добавляем последнюю часть номера с дефисом
  if (phoneNumber.length > 9) {
    formattedNumber += '-' + phoneNumber.substring(9, 11);
  }

  return formattedNumber;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Добавляем состояние для телефона (если телефон не привязан к аккаунту)
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const { data: cartData, loading: cartLoading } = useQuery(GET_CART);
  const { data: addressesData, loading: addressesLoading } = useQuery(
    GET_DELIVERY_ADDRESSES
  );
  const { data: userData, loading: userLoading } = useQuery(GET_VIEWER);
  const [checkout, { loading: checkoutLoading }] = useMutation(CHECK_OUT);

  // Определяем, авторизован ли пользователь
  const isRegisteredUser = useMemo(() => {
    return userData?.viewer?.__typename === 'RegisteredViewer';
  }, [userData]);

  // Автоматически устанавливаем телефон из профиля, если он есть
  useEffect(() => {
    if (isRegisteredUser && userData?.viewer?.phoneNumber) {
      setPhoneNumber(formatPhoneNumber(userData.viewer.phoneNumber));
    }
  }, [isRegisteredUser, userData]);

  // Получаем адреса доставки
  const addresses = useMemo(() => {
    return addressesData?.deliveryAddresses || [];
  }, [addressesData]);

  // Получаем товары в корзине
  const cartItems = useMemo(() => {
    return (
      cartData?.cart?.items?.edges?.map(
        (edge: { node: CartItem }) => edge.node
      ) || []
    );
  }, [cartData]);

  // Получаем общую сумму
  const cartTotal = useMemo(() => {
    return cartData?.cart?.items?.decimalTotalPrice || '0';
  }, [cartData]);

  // Если есть адрес по умолчанию, выбираем его
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  // Валидация телефона
  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) {
      setPhoneError('Телефон обязателен для заказа');
      return false;
    }

    // Проверяем, что номер начинается с +7 и имеет правильную длину
    if (!phone.startsWith('+7') || phone.length !== 12) {
      setPhoneError('Введите корректный номер телефона');
      return false;
    }

    setPhoneError('');
    return true;
  };

  // Форматирование номера для API
  const formatPhoneForApi = (phone: string): string => {
    // Удаляем все нецифровые символы
    return phone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPhoneError('');

    // Валидация
    if (cartItems.length === 0) {
      setErrorMessage('Ваша корзина пуста');
      return;
    }

    if (!isRegisteredUser) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push('/login?redirect=checkout');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      return;
    }

    if (!selectedAddressId) {
      setErrorMessage('Для оформления заказа необходимо выбрать адрес');
      return;
    }

    const formattedPhone = formatPhoneForApi(phoneNumber);

    if (!formattedPhone || formattedPhone.length < 10) {
      setPhoneError('Некорректный формат телефона');
      return;
    }

    try {
      console.log('Оформление заказа, отправляемые данные:', {
        deliveryAddressId: selectedAddressId,
        phoneNumber: formattedPhone,
      });

      const result = await checkout({
        variables: {
          deliveryAddressId: selectedAddressId,
          phoneNumber: formattedPhone,
        },
      });

      console.log('Результат запроса:', result);

      if (result.data?.checkOut?.order) {
        const order = result.data.checkOut.order;

        // Отправляем данные о заказе в Яндекс.Метрику
        const orderItems = cartItems.map((item: CartItem) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category?.title || '',
        }));

        trackOrder(order.id, orderItems, parseFloat(cartTotal));

        // Добавляем параметр success=true для отображения сообщения об успешном оформлении
        router.push(`/orders/${order.id}?success=true`);
      } else if (result.data?.checkOut?.message) {
        setErrorMessage(result.data.checkOut.message);
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage =
        error instanceof Error
          ? `${error.message}`
          : 'Произошла ошибка при оформлении заказа';
      setErrorMessage(errorMessage);
    }
  };

  if (cartLoading || addressesLoading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Оформление заказа
          </h1>
          <p className="text-gray-600 mb-6">Ваша корзина пуста</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Вернуться к покупкам
          </Link>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем страницу с предложением войти
  if (!isRegisteredUser) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-6">
            <UserIcon className="h-16 w-16 text-blue-600 bg-blue-100 p-4 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Авторизация для оформления заказа
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Для оформления заказа необходимо войти в аккаунт или
            зарегистрироваться.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href={`/login?redirect=checkout`}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-center flex-1 max-w-xs mx-auto flex items-center justify-center"
            >
              <span>Войти в аккаунт</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/register?redirect=checkout`}
              className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors text-center flex-1 max-w-xs mx-auto"
            >
              Зарегистрироваться
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Ваша корзина ({cartItems.length})
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-contain rounded-md border border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Количество: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat('ru-RU').format(
                        item.product.price * item.quantity
                      )}{' '}
                      ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
              <p className="font-medium text-gray-800">Итого:</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('ru-RU').format(parseFloat(cartTotal))} ₽
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Оформление заказа
      </h1>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Контактный телефон */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <UserIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Контактные данные</h2>
              </div>

              <div className="mt-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Номер телефона *
                </label>
                <div className="relative mt-1">
                  <PhoneInput
                    country={'ru'}
                    value={phoneNumber}
                    onChange={(value) => setPhoneNumber('+' + value)}
                    inputClass={`w-full !h-[42px] !pl-[48px] !rounded-lg !border ${
                      phoneError
                        ? '!border-red-300 !text-red-900 !placeholder-red-300 focus:!outline-none focus:!ring-red-500 focus:!border-red-500'
                        : '!border-gray-300 focus:!ring-blue-500 focus:!border-blue-500'
                    } !shadow-sm !text-gray-900 !placeholder-gray-400 focus:!outline-none focus:!ring-2 transition-colors`}
                    buttonClass="!border-gray-300 !rounded-l-lg"
                    containerClass="!w-full"
                    specialLabel=""
                    inputProps={{
                      id: 'phone',
                      name: 'phone',
                      autoComplete: 'tel',
                      'aria-invalid': phoneError ? 'true' : 'false',
                      'aria-describedby': phoneError
                        ? 'phone-error'
                        : undefined,
                    }}
                  />
                  {phoneError && (
                    <p
                      className="mt-2 text-sm text-red-600 flex items-center"
                      id="phone-error"
                    >
                      <svg
                        className="h-4 w-4 mr-1 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {phoneError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Нужен для связи по вашему заказу
                  </p>
                </div>
              </div>
            </div>

            {/* Адрес доставки */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Адрес доставки</h2>
              </div>

              {addresses.length === 0 ? (
                <div className="mb-4 bg-gray-50 p-6 rounded-md text-center">
                  <p className="text-gray-600 mb-4">
                    У вас еще нет сохраненных адресов доставки
                  </p>
                  <Link
                    href="/profile/addresses/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Добавить адрес
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address: DeliveryAddress) => (
                    <label
                      key={address.id}
                      className={`block border p-4 rounded-md cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="addressId"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <p className="text-gray-700">{address.fullAddress}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                  <div className="mt-4 text-center md:text-left">
                    <Link
                      href="/profile/addresses/new"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      Добавить новый адрес
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={checkoutLoading || addresses.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-md hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {checkoutLoading ? (
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
                  Оформляем заказ...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Оформить заказ
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-100">
              Ваш заказ
            </h2>

            <div className="mb-6 max-h-96 overflow-y-auto pr-1 space-y-4">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="py-3 border-b border-gray-100 last:border-b-0 flex items-center gap-3 group hover:bg-gray-50 rounded-md p-1 transition-colors"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-contain rounded-md border border-gray-200 group-hover:border-gray-300 transition-colors"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-blue-700 transition-colors">
                      {item.product.name}
                    </p>
                    <div className="flex justify-between mt-1.5">
                      <p className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.quantity} шт.
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Intl.NumberFormat('ru-RU').format(
                          item.product.price * item.quantity
                        )}{' '}
                        ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({cartItems.length}):</span>
                <span>
                  {new Intl.NumberFormat('ru-RU').format(parseFloat(cartTotal))}{' '}
                  ₽
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка:</span>
                <span className="text-green-600 font-medium">Бесплатно</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Итого:</span>
                <span className="font-bold text-xl text-blue-600">
                  {new Intl.NumberFormat('ru-RU').format(parseFloat(cartTotal))}{' '}
                  ₽
                </span>
              </div>
            </div>

            {addresses.length === 0 && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-yellow-400 mt-0.5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-yellow-700">
                    Для оформления заказа добавьте адрес доставки
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
