"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TruckIcon,
  CreditCardIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CreditCardIcon as CreditCardOutlineIcon,
  GlobeEuropeAfricaIcon,
} from "@heroicons/react/24/outline";

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Доставка и оплата
        </h1>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-500">Доставка и оплата</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <TruckIcon className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            Курьерская доставка
          </h2>
          <p className="text-gray-600 text-center">
            Доставка по всей России. Сроки доставки от 1 до 7 дней в зависимости
            от региона.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <MapPinIcon className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Самовывоз</h2>
          <p className="text-gray-600 text-center">
            Вы можете забрать свой заказ бесплатно в нашем пункте выдачи заказов
            в Москве.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            Экспресс-доставка
          </h2>
          <p className="text-gray-600 text-center">
            Доставка в день заказа или на следующий день для Москвы и ближайшего
            Подмосковья.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Сроки и стоимость доставки</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left border border-gray-200">
                  Регион
                </th>
                <th className="py-3 px-4 text-left border border-gray-200">
                  Сроки доставки
                </th>
                <th className="py-3 px-4 text-left border border-gray-200">
                  Стоимость
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border border-gray-200">Москва</td>
                <td className="py-3 px-4 border border-gray-200">1-2 дня</td>
                <td className="py-3 px-4 border border-gray-200">от 300 ₽</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 border border-gray-200">
                  Московская область
                </td>
                <td className="py-3 px-4 border border-gray-200">1-3 дня</td>
                <td className="py-3 px-4 border border-gray-200">от 450 ₽</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border border-gray-200">
                  Санкт-Петербург
                </td>
                <td className="py-3 px-4 border border-gray-200">2-4 дня</td>
                <td className="py-3 px-4 border border-gray-200">от 500 ₽</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 border border-gray-200">
                  Другие регионы
                </td>
                <td className="py-3 px-4 border border-gray-200">3-7 дней</td>
                <td className="py-3 px-4 border border-gray-200">от 600 ₽</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-700 text-sm">
            <strong>Примечание:</strong> При заказе на сумму от 5000 ₽ доставка
            по Москве бесплатна. При заказе на сумму от 10000 ₽ доставка по
            Московской области бесплатна.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Способы оплаты</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-full mr-4">
              <CreditCardIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold">Банковской картой онлайн</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Оплата заказа банковской картой Visa, MasterCard, МИР на сайте через
            защищенное соединение.
          </p>
          <div className="flex space-x-3">
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <Image
                src="/visa.png"
                alt="Visa"
                width={30}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <Image
                src="/mastercard.png"
                alt="MasterCard"
                width={30}
                height={20}
                className="object-contain"
              />
            </div>
            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
              <Image
                src="/mir.png"
                alt="МИР"
                width={30}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-full mr-4">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Наличными при получении</h3>
          </div>
          <p className="text-gray-600">
            Оплата наличными курьеру при получении заказа или в пункте
            самовывоза. Курьер привозит все необходимые документы и кассовый
            чек.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-full mr-4">
              <CreditCardOutlineIcon className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold">Картой при получении</h3>
          </div>
          <p className="text-gray-600">
            Оплата банковской картой при получении заказа. Курьеры оснащены
            мобильными терминалами для приема карт Visa, MasterCard, МИР.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-full mr-4">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold">Безналичный расчет</h3>
          </div>
          <p className="text-gray-600">
            Для юридических лиц доступна оплата по безналичному расчету.
            Выставление счета и все необходимые документы предоставляются.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Как отследить мой заказ?
            </h3>
            <p className="text-gray-600">
              Вы можете отследить статус своего заказа в личном кабинете на
              сайте или позвонив по телефону 8 800 555-35-35.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Что делать, если товар не подошел?
            </h3>
            <p className="text-gray-600">
              Вы можете вернуть товар в течение 14 дней с момента получения
              заказа. Подробнее в разделе &quot;Возврат и обмен&quot;.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Как изменить адрес доставки?
            </h3>
            <p className="text-gray-600">
              Вы можете изменить адрес доставки до момента отправки заказа,
              связавшись с нашим колл-центром или через личный кабинет.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Доставляете ли вы в выходные дни?
            </h3>
            <p className="text-gray-600">
              Да, доставка осуществляется и в выходные дни в большинстве
              регионов. Время доставки согласовывается с курьером.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Доставка по России</h2>

        <div className="space-y-6">
          <div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3 mt-1">
                <GlobeEuropeAfricaIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">
                  Доставка по России
                </h3>
                <div className="mt-2 text-gray-600">
                  <p className="mb-2">
                    Доставка по России осуществляется через транспортные
                    компании &quot;СДЭК&quot;, &quot;Деловые Линии&quot;,
                    &quot;ПЭК&quot; и &quot;Почта России&quot;. Стоимость и
                    сроки рассчитываются индивидуально.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
