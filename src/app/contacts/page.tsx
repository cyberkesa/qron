'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_REGION } from '@/lib/queries';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Map } from '@/components/contacts/Map';

// Контактная информация для разных регионов
const regionContacts = {
  moscow: {
    address: 'Домодедовское шоссе, 4-й километр, 15Б',
    phone: '+7 (495) 799-26-66',
    phoneLink: 'tel:+74957992666',
    email: 'info@tovari-kron.ru',
    workingHours: 'Пн-Сб: 9:00 - 18:00',
    coordinates: {
      lat: 55.4387,
      lng: 37.663,
    },
  },
  stavropol: {
    address: 'с. Надежда, ул. Орджоникидзе 79',
    phone: '+7 (903) 418-16-66',
    phoneLink: 'tel:+79034181666',
    email: 'ug@tovari-kron.ru',
    workingHours: 'Пн-Сб: 9:00 - 18:00',
    coordinates: {
      lat: 45.0394,
      lng: 42.0807,
    },
  },
};

export default function ContactsPage() {
  const { data: regionData } = useQuery(GET_CURRENT_REGION);
  const [activeRegion, setActiveRegion] = useState<string>('moscow');

  useEffect(() => {
    if (regionData?.viewer?.region?.name) {
      const detectedRegion = regionData.viewer.region.name.toLowerCase();
      if (
        detectedRegion.includes('москва') ||
        detectedRegion.includes('moscow')
      ) {
        setActiveRegion('moscow');
      } else if (
        detectedRegion.includes('ставрополь') ||
        detectedRegion.includes('stavropol')
      ) {
        setActiveRegion('stavropol');
      }
    }
  }, [regionData]);

  const contacts = regionContacts[activeRegion as keyof typeof regionContacts];

  const openExternalMap = () => {
    const { lat, lng } = contacts.coordinates;
    window.open(`https://maps.google.com?q=${lat},${lng}`, '_blank');
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
        <h1 className="text-2xl font-bold mb-6 md:text-3xl">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-xl font-semibold mb-4">Наш адрес</h2>
            <p className="mb-6">123456, г. Москва, ул. Примерная, д. 123</p>
          </div>
        </div>

        {/* Region selector tabs */}
        <div className="flex flex-wrap mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 inline-flex space-x-1">
            <button
              onClick={() => setActiveRegion('moscow')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeRegion === 'moscow'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Москва
            </button>
            <button
              onClick={() => setActiveRegion('stavropol')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeRegion === 'stavropol'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Ставрополь
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Контактная информация
              </h2>

              <div className="space-y-5">
                <div className="flex items-start group">
                  <div className="p-2 rounded-full bg-blue-50 mr-4 group-hover:bg-blue-100 transition-colors duration-200">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Телефон</h3>
                    <a
                      href={contacts.phoneLink}
                      className="text-blue-600 hover:text-blue-800 text-lg font-medium transition-colors duration-200 hover:underline"
                    >
                      {contacts.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-2 rounded-full bg-green-50 mr-4 group-hover:bg-green-100 transition-colors duration-200">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200 hover:underline"
                    >
                      {contacts.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-2 rounded-full bg-yellow-50 mr-4 group-hover:bg-yellow-100 transition-colors duration-200">
                    <MapPinIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Адрес</h3>
                    <p className="text-gray-700 mb-1">{contacts.address}</p>
                    <button
                      onClick={openExternalMap}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1 transition-colors duration-200 hover:underline"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Открыть в Google Maps
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-2 rounded-full bg-red-50 mr-4 group-hover:bg-red-100 transition-colors duration-200">
                    <ClockIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Режим работы</h3>
                    <p className="text-gray-700 mb-1">
                      {contacts.workingHours}
                    </p>
                    <p className="text-gray-700">Вс: Выходной</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Остались вопросы?
              </h3>
              <p className="text-blue-700 mb-4">
                Вы можете связаться с нами любым удобным способом или посетить
                наш офис в рабочее время.
              </p>
              <div className="flex space-x-3">
                <a
                  href={contacts.phoneLink}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center text-sm transition-colors duration-200 active:scale-[0.98]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Позвонить
                </a>
                <a
                  href={`mailto:${contacts.email}`}
                  className="flex-1 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-center text-sm transition-colors duration-200 active:scale-[0.98]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Написать
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 h-[500px] md:h-[600px]">
              <Map
                coordinates={contacts.coordinates}
                zoom={16}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
