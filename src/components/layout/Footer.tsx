'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '@/lib/queries';
import { Category } from '@/types/api';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data } = useQuery(GET_CATEGORIES);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Toggle section visibility for mobile
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Определяем основные категории (максимум 6)
  const mainCategories = (data?.rootCategories || []).slice(0, 6);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-700 w-full">
      {/* Основная часть футера */}
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Мобильная версия с аккордеонами */}
        <div className="md:hidden">
          <div className="mb-6">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 mb-4 flex items-center justify-center"
            >
              <span className="bg-blue-600 text-white p-1 rounded mr-1">
                КРОН
              </span>
              <span className="text-gray-700">Маркет</span>
            </Link>
            <p className="text-gray-600 mb-5 text-sm text-center">
              Ваш надежный поставщик строительных и отделочных материалов с 2010
              года
            </p>
          </div>

          {/* Каталог - аккордеон */}
          <div className="border-t border-gray-200 py-3">
            <button
              onClick={() => toggleSection('catalog')}
              className="w-full flex justify-between items-center py-2"
            >
              <h3 className="text-base font-semibold text-gray-800">Каталог</h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedSection === 'catalog' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'catalog' && (
              <ul className="grid grid-cols-1 gap-3 mt-2 pl-2">
                {mainCategories.map((category: Category) => (
                  <li key={category.id} className="flex items-center">
                    <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-base py-1"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center mt-1">
                  <Link
                    href="/catalog"
                    className="text-blue-600 hover:text-blue-800 transition-colors text-base font-medium flex items-center py-1"
                  >
                    Все товары
                    <ChevronRightIcon className="h-4 w-4 text-[#2A7AE9] ml-1.5 inline-flex items-center" />
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Информация - аккордеон */}
          <div className="border-t border-gray-200 py-3">
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex justify-between items-center py-2"
            >
              <h3 className="text-base font-semibold text-gray-800">
                Информация
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedSection === 'info' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'info' && (
              <ul className="space-y-3 mt-2 pl-2">
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <Link
                    href="/delivery"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base py-1"
                  >
                    Доставка и оплата
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base py-1"
                  >
                    О компании
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <Link
                    href="/contacts"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base py-1"
                  >
                    Контакты
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-blue-600 transition-colors text-base py-1"
                  >
                    Политика конфиденциальности
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Контакты - аккордеон */}
          <div className="border-t border-gray-200 py-3">
            <button
              onClick={() => toggleSection('contacts')}
              className="w-full flex justify-between items-center py-2"
            >
              <h3 className="text-base font-semibold text-gray-800">
                Контакты
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedSection === 'contacts' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'contacts' && (
              <ul className="space-y-4 mt-2 pl-2">
                <li className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3 flex-shrink-0">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <a
                      href="tel:+74957992666"
                      className="text-gray-900 hover:text-blue-600 transition-colors font-medium text-base"
                    >
                      +7 (495) 799-26-66
                    </a>
                    <p className="text-gray-500 text-sm">Бесплатно по России</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3 flex-shrink-0">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <a
                      href="mailto:info@tovari-kron.ru"
                      className="text-gray-900 hover:text-blue-600 transition-colors text-base"
                    >
                      info@tovari-kron.ru
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3 flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-base">
                      Пн-Сб: 9:00 - 18:00
                    </p>
                    <p className="text-gray-700 text-base">Вс: выходной</p>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Десктопная версия */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 mb-4 flex items-center"
            >
              <span className="bg-blue-600 text-white p-1 rounded mr-1">
                КРОН
              </span>
              <span className="text-gray-700">Маркет</span>
            </Link>
            <p className="text-gray-600 mb-4 text-sm">
              Ваш надежный поставщик строительных и отделочных материалов с 2010
              года
            </p>
          </div>

          {/* Каталог и навигация */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-800">
              Каталог
            </h3>
            <ul className="grid grid-cols-1 gap-2">
              {mainCategories.map((category: Category) => (
                <li key={category.id} className="flex items-center">
                  <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm truncate"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
              <li className="flex items-center">
                <Link
                  href="/catalog"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center"
                >
                  Все товары
                  <ChevronRightIcon className="h-4 w-4 text-[#2A7AE9] ml-1.5 inline-flex items-center" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-800">
              Информация
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                <Link
                  href="/delivery"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  О компании
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                <Link
                  href="/contacts"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Контакты
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-800">
              Контакты
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <a
                    href="tel:+74957992666"
                    className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
                  >
                    +7 (495) 799-26-66
                  </a>
                  <p className="text-gray-500 text-xs">Бесплатно по России</p>
                </div>
              </li>
              <li className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <a
                    href="mailto:info@tovari-kron.ru"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    info@tovari-kron.ru
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <ClockIcon className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm">Пн-Сб: 9:00 - 18:00</p>
                  <p className="text-gray-700 text-sm">Вс: выходной</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs mb-4 md:mb-0 text-center md:text-left">
            © {currentYear} ООО &laquo;КРОН&raquo;. Все права защищены
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:flex-row md:space-y-0 md:space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Карта сайта
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Оферта
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Пользовательское соглашение
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
