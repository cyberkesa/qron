"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_CART,
  GET_DELIVERY_ADDRESSES,
  CHECK_OUT,
  GET_VIEWER,
} from "@/lib/queries";
import {
  DeliveryMethod,
  PaymentMethod,
  DeliveryAddress,
  CartItem,
} from "@/types/api";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCartIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  UserIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { trackOrder } from "@/lib/analytics";

// Функция для форматирования цены
const formatPrice = (price: string) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(price));
};

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CARD,
  );
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<DeliveryMethod>(DeliveryMethod.DELIVERY);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Добавляем состояние для телефона (если телефон не привязан к аккаунту)
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const { data: cartData, loading: cartLoading } = useQuery(GET_CART);
  const { data: addressesData, loading: addressesLoading } = useQuery(
    GET_DELIVERY_ADDRESSES,
  );
  const { data: userData, loading: userLoading } = useQuery(GET_VIEWER);
  const [checkout, { loading: checkoutLoading }] = useMutation(CHECK_OUT);

  // Определяем, авторизован ли пользователь
  const isRegisteredUser = useMemo(() => {
    return userData?.viewer?.__typename === "RegisteredViewer";
  }, [userData]);

  // Автоматически устанавливаем телефон из профиля, если он есть
  useEffect(() => {
    if (isRegisteredUser && userData?.viewer?.phoneNumber) {
      setPhoneNumber(userData.viewer.phoneNumber);
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
        (edge: { node: CartItem }) => edge.node,
      ) || []
    );
  }, [cartData]);

  // Получаем общую сумму
  const cartTotal = useMemo(() => {
    return cartData?.cart?.items?.decimalTotalPrice || "0";
  }, [cartData]);

  // Если есть адрес по умолчанию, выбираем его
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  // Валидация телефона
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

    if (!phone.trim()) {
      setPhoneError("Телефон обязателен для заказа");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      setPhoneError("Введите телефон в формате +7 (999) 123-45-67");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setPhoneError("");

    // Валидация
    if (cartItems.length === 0) {
      setErrorMessage("Ваша корзина пуста");
      return;
    }

    if (!isRegisteredUser) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      router.push("/login?redirect=checkout");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      return;
    }

    if (
      selectedDeliveryMethod === DeliveryMethod.DELIVERY &&
      !selectedAddressId
    ) {
      setErrorMessage("Для доставки необходимо выбрать адрес");
      return;
    }

    try {
      const result = await checkout({
        variables: {
          deliveryAddressId: selectedAddressId,
          paymentMethod,
          deliveryMethod: selectedDeliveryMethod,
          phoneNumber: phoneNumber,
        },
      });

      if (result.data?.checkOut?.order) {
        const order = result.data.checkOut.order;

        // Отправляем данные о заказе в Яндекс.Метрику
        const orderItems = cartItems.map((item: CartItem) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category?.title || "",
        }));

        trackOrder(order.id, orderItems, parseFloat(cartTotal));

        router.push(`/orders/${order.id}`);
      } else if (result.data?.checkOut?.message) {
        setErrorMessage(result.data.checkOut.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при оформлении заказа";
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
                      {new Intl.NumberFormat("ru-RU").format(
                        item.product.price * item.quantity,
                      )}{" "}
                      ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
              <p className="font-medium text-gray-800">Итого:</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat("ru-RU").format(parseFloat(cartTotal))} ₽
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

              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Телефон для связи *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className={`w-full px-4 py-2 border ${
                    phoneError ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
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
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
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

            {/* Способ доставки */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Способ доставки</h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    selectedDeliveryMethod === DeliveryMethod.DELIVERY
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.DELIVERY}
                      checked={
                        selectedDeliveryMethod === DeliveryMethod.DELIVERY
                      }
                      onChange={() =>
                        setSelectedDeliveryMethod(DeliveryMethod.DELIVERY)
                      }
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Доставка курьером
                      </p>
                      <p className="text-gray-600 text-sm">
                        Доставка заказа по указанному адресу
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    selectedDeliveryMethod === DeliveryMethod.PICKUP
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.PICKUP}
                      checked={selectedDeliveryMethod === DeliveryMethod.PICKUP}
                      onChange={() =>
                        setSelectedDeliveryMethod(DeliveryMethod.PICKUP)
                      }
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">Самовывоз</p>
                      <p className="text-gray-600 text-sm">
                        Самовывоз заказа из пункта выдачи
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Способ оплаты */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Способ оплаты</h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    paymentMethod === PaymentMethod.CARD
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.CARD}
                      checked={paymentMethod === PaymentMethod.CARD}
                      onChange={() => setPaymentMethod(PaymentMethod.CARD)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Банковской картой онлайн
                      </p>
                      <p className="text-gray-600 text-sm">
                        Оплата картой на сайте через защищенное соединение
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    paymentMethod === PaymentMethod.CASH
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.CASH}
                      checked={paymentMethod === PaymentMethod.CASH}
                      onChange={() => setPaymentMethod(PaymentMethod.CASH)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Наличными при получении
                      </p>
                      <p className="text-gray-600 text-sm">
                        Оплата наличными курьеру при доставке
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutLoading || addresses.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium"
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
                "Оформить заказ"
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>

            <div className="mb-4 max-h-96 overflow-y-auto">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="py-3 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
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
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {item.product.name}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        {item.quantity} шт.
                      </p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Intl.NumberFormat("ru-RU").format(
                          item.product.price * item.quantity,
                        )}{" "}
                        ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({cartItems.length}):</span>
                <span>
                  {new Intl.NumberFormat("ru-RU").format(parseFloat(cartTotal))}{" "}
                  ₽
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка:</span>
                <span>0 ₽</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Итого:</span>
                <span className="font-bold text-xl text-blue-600">
                  {new Intl.NumberFormat("ru-RU").format(parseFloat(cartTotal))}{" "}
                  ₽
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
