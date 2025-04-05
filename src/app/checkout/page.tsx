"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CART, GET_DELIVERY_ADDRESSES, CHECK_OUT } from "@/lib/queries";
import { DeliveryMethod, PaymentMethod } from "@/types/api";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCartIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CARD
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    DeliveryMethod.DELIVERY
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: cartData, loading: cartLoading } = useQuery(GET_CART);
  const { data: addressesData, loading: addressesLoading } = useQuery(
    GET_DELIVERY_ADDRESSES
  );
  const [checkout, { loading: checkoutLoading }] = useMutation(CHECK_OUT);

  const addresses = addressesData?.viewer?.deliveryAddresses || [];
  const cartItems =
    cartData?.cart?.items?.edges?.map((edge: any) => edge.node) || [];
  const cartTotal = cartData?.cart?.items?.decimalTotalPrice || "0";

  // Если есть адрес по умолчанию, выбираем его
  useEffect(() => {
    const defaultAddress = addresses.find((address: any) => address.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedAddressId) {
      setErrorMessage("Пожалуйста, выберите адрес доставки");
      return;
    }

    try {
      const result = await checkout({
        variables: {
          deliveryAddressId: selectedAddressId,
          paymentMethod,
          deliveryMethod,
        },
      });

      if (result.data?.checkOut?.order) {
        // При успешном оформлении заказа, перенаправляем на страницу заказа
        router.push(`/orders/${result.data.checkOut.order.id}`);
      } else if (result.data?.checkOut?.message) {
        setErrorMessage(result.data.checkOut.message);
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "Произошла ошибка при оформлении заказа"
      );
    }
  };

  if (cartLoading || addressesLoading) {
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
                  {addresses.map((address: any) => (
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
                          <p className="font-semibold">{address.fullName}</p>
                          <p className="text-gray-700">
                            {address.address}, {address.city},{" "}
                            {address.postalCode}
                          </p>
                          <p className="text-gray-700">{address.phoneNumber}</p>
                          {address.isDefault && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded">
                              По умолчанию
                            </span>
                          )}
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
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Добавить новый адрес
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <TruckIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Способ доставки</h2>
              </div>

              <div className="space-y-4">
                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    deliveryMethod === DeliveryMethod.DELIVERY
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.DELIVERY}
                      checked={deliveryMethod === DeliveryMethod.DELIVERY}
                      onChange={() =>
                        setDeliveryMethod(DeliveryMethod.DELIVERY)
                      }
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-semibold">Курьерская доставка</p>
                      <p className="text-gray-600">
                        Доставка в течение 1-3 дней
                      </p>
                    </div>
                  </div>
                </label>
                <label
                  className={`block border p-4 rounded-md cursor-pointer transition-all ${
                    deliveryMethod === DeliveryMethod.PICKUP
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.PICKUP}
                      checked={deliveryMethod === DeliveryMethod.PICKUP}
                      onChange={() => setDeliveryMethod(DeliveryMethod.PICKUP)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-semibold">Самовывоз</p>
                      <p className="text-gray-600">Из пункта выдачи заказов</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

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
                      <p className="font-semibold">Банковская карта</p>
                      <p className="text-gray-600">Оплата онлайн</p>
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
                      <p className="font-semibold">Наличные</p>
                      <p className="text-gray-600">Оплата при получении</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutLoading || addresses.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {checkoutLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Оформление заказа...
                </span>
              ) : (
                "Оформить заказ"
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4 pb-3 border-b">
              Ваш заказ
            </h2>
            <div className="divide-y divide-gray-100 mb-6">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-gray-600 text-sm">
                        {item.quantity} шт.
                      </p>
                      <p className="font-medium">
                        {item.product.price.toLocaleString()} ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({cartItems.length}):</span>
                <span>{cartTotal} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка:</span>
                <span>Бесплатно</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Итого:</span>
                <span className="text-blue-600">{cartTotal} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
