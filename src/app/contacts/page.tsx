"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_CURRENT_REGION } from "@/lib/queries";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Map } from "@/components/contacts/Map";

// Контактная информация для разных регионов
const regionContacts = {
  moscow: {
    address: "Домодедовское шоссе, 4-й километр, 15Б",
    phone: "+7 (495) 799-26-66",
    phoneLink: "tel:+74957992666",
    email: "info@tovari-kron.ru",
    workingHours: "Пн-Пт: 9:00 - 18:00",
    coordinates: {
      lat: 55.6122,
      lng: 37.7153,
    },
  },
  stavropol: {
    address: "с. Надежда, ул. Орджоникидзе 79",
    phone: "+7 (903) 418-16-66",
    phoneLink: "tel:+79034181666",
    email: "ug@tovari-kron.ru",
    workingHours: "Пн-Пт: 8:00 - 17:00",
    coordinates: {
      lat: 45.0428,
      lng: 41.9734,
    },
  },
};

export default function ContactsPage() {
  const { data: regionData } = useQuery(GET_CURRENT_REGION);
  const currentRegion =
    regionData?.viewer?.region?.name?.toLowerCase() || "moscow";
  const contacts =
    regionContacts[currentRegion as keyof typeof regionContacts] ||
    regionContacts.moscow;

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    submitted: false,
    error: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setFormState((prev) => ({
        ...prev,
        submitted: true,
        name: "",
        email: "",
        phone: "",
        message: "",
      }));
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Контакты</h1>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Контакты</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Наши контакты</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 mr-4">
                  <PhoneIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Телефон</h3>
                  <p className="text-gray-700 mb-1">
                    <a
                      href={contacts.phoneLink}
                      className="hover:text-blue-600"
                    >
                      {contacts.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-green-100 mr-4">
                  <EnvelopeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Email</h3>
                  <p className="text-gray-700 mb-1">
                    <a
                      href={`mailto:${contacts.email}`}
                      className="hover:text-blue-600"
                    >
                      {contacts.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-yellow-100 mr-4">
                  <MapPinIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Адрес</h3>
                  <p className="text-gray-700 mb-1">{contacts.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-red-100 mr-4">
                  <ClockIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Режим работы</h3>
                  <p className="text-gray-700 mb-1">{contacts.workingHours}</p>
                  <p className="text-gray-700">Сб-Вс: Выходной</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-full bg-indigo-100 mr-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Реквизиты</h3>
                  <p className="text-gray-700 mb-1">ООО "КРОН"</p>
                  <p className="text-gray-700 mb-1">ИНН: 7712345678</p>
                  <p className="text-gray-700">ОГРН: 1157746123456</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Мы в социальных сетях</h2>
            <div className="flex space-x-4">
              <a
                href="https://vk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23c-.42.814-1.407 2.47-1.407 2.47-.12.186-.323.298-.54.298-.217 0-.42-.112-.54-.298V7.72c0-.275-.23-.5-.516-.5h-1.953C11.46 7.22 11.224 7 11 7c-.224 0-.46.22-.46.5v7.96c0 .278.236.5.515.5h1.953c.286 0 .516-.223.516-.5v-2.96c0-.275.224-.5.5-.5s.5.225.5.5v2.96c0 .278.224.5.5.5h1.962c.286 0 .538-.223.538-.5v-5.96c0-.275.224-.5.5-.5s.5.225.5.5v5.96c0 .278.252.5.538.5h1.962c.276 0 .5-.223.5-.5V7.72c0-.275-.224-.5-.5-.5z" />
                </svg>
              </a>
              <a
                href="https://telegram.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.417 15.181L9.237 18.29c.248 0 .354-.102.483-.224l1.164-1.08 2.408 1.709c.443.245.765.118.881-.396l1.593-7.435c.143-.67-.243-.975-.66-.781L5.563 13.667c-.65.245-.645.625-.118.788l2.409.751 5.595-3.396c.262-.161.505-.075.306.102l-4.338 3.76z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Форма обратной связи</h2>

            {formState.submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
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
                    <h3 className="text-sm font-medium text-green-800">
                      Сообщение отправлено
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Спасибо за ваше обращение! Мы свяжемся с вами в
                        ближайшее время.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ваше имя*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Сообщение*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Отправить сообщение
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  * Поля, обязательные для заполнения
                </p>
              </form>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Как нас найти</h2>
            <div className="rounded-lg overflow-hidden shadow-md h-[400px]">
              <Map center={contacts.coordinates} zoom={15} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-8 text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Нужна консультация?
        </h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-6">
          Если у вас остались вопросы или вам нужна дополнительная информация,
          наша команда готова помочь вам по телефону или электронной почте.
        </p>
        <div className="inline-flex space-x-4">
          <a
            href={contacts.phoneLink}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PhoneIcon className="w-5 h-5 mr-2" />
            Позвонить нам
          </a>
          <a
            href={`mailto:${contacts.email}`}
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors flex items-center"
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Написать email
          </a>
        </div>
      </div>
    </div>
  );
}
