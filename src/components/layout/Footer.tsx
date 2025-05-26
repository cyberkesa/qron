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
          <div className="mb-8">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 mb-4 flex items-center justify-center hover:scale-105 transition-transform duration-200"
            >
              <span className="bg-blue-600 text-white p-2 rounded-lg mr-2 shadow-sm">
                КРОН
              </span>
              <span className="text-gray-700">Маркет</span>
            </Link>
            <p className="text-gray-600 mb-6 text-sm text-center leading-relaxed px-4">
              Ваш надежный поставщик строительных и отделочных материалов с 2010
              года
            </p>
          </div>

          {/* Каталог - аккордеон */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleSection('catalog')}
              className="w-full flex justify-between items-center py-3 px-2 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Каталог
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSection === 'catalog' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'catalog' && (
              <ul className="grid grid-cols-1 gap-2 mt-3 pl-2 animate-fade-in-down">
                {mainCategories.map((category: Category) => (
                  <li key={category.id} className="flex items-center">
                    <ChevronRightIcon className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-gray-600 hover:text-blue-600 transition-all duration-200 text-base py-2 px-2 rounded-lg hover:bg-gray-50 flex-1 active:scale-95"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center mt-2 pt-2 border-t border-gray-100">
                  <Link
                    href="/catalog"
                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 text-base font-medium flex items-center py-2 px-2 rounded-lg hover:bg-blue-50 active:scale-95"
                  >
                    Все товары
                    <ChevronRightIcon className="h-4 w-4 text-blue-600 ml-2 inline-flex items-center" />
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Информация - аккордеон */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex justify-between items-center py-3 px-2 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Информация
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSection === 'info' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'info' && (
              <ul className="grid grid-cols-1 gap-2 mt-3 pl-2 animate-fade-in-down">
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <Link
                    href="/delivery"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 text-base py-2 px-2 rounded-lg hover:bg-gray-50 flex-1 active:scale-95"
                  >
                    Доставка и оплата
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 text-base py-2 px-2 rounded-lg hover:bg-gray-50 flex-1 active:scale-95"
                  >
                    О компании
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <Link
                    href="/contacts"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 text-base py-2 px-2 rounded-lg hover:bg-gray-50 flex-1 active:scale-95"
                  >
                    Контакты
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRightIcon className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 text-base py-2 px-2 rounded-lg hover:bg-gray-50 flex-1 active:scale-95"
                  >
                    Политика конфиденциальности
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Контакты - аккордеон */}
          <div className="border-t border-gray-200 py-4">
            <button
              onClick={() => toggleSection('contacts')}
              className="w-full flex justify-between items-center py-3 px-2 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
                Контакты
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSection === 'contacts' ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {expandedSection === 'contacts' && (
              <ul className="space-y-4 mt-3 pl-2 animate-fade-in-down">
                <li className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <div className="bg-amber-50 p-2.5 rounded-xl mr-3 flex-shrink-0">
                    <PhoneIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <a
                      href="tel:+74957992666"
                      className="text-gray-900 hover:text-amber-600 transition-colors font-medium text-base"
                    >
                      +7 (495) 799-26-66
                    </a>
                    <p className="text-gray-500 text-sm">Бесплатно по России</p>
                  </div>
                </li>
                <li className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <div className="bg-amber-50 p-2.5 rounded-xl mr-3 flex-shrink-0">
                    <EnvelopeIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <a
                      href="mailto:info@tovari-kron.ru"
                      className="text-gray-900 hover:text-amber-600 transition-colors text-base"
                    >
                      info@tovari-kron.ru
                    </a>
                  </div>
                </li>
                <li className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <div className="bg-amber-50 p-2.5 rounded-xl mr-3 flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 text-base font-medium">
                      Пн-Сб: 9:00 - 18:00
                    </p>
                    <p className="text-gray-500 text-sm">Вс: выходной</p>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Десктопная версия */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* О компании */}
          <div>
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 mb-6 flex items-center hover:scale-105 transition-transform duration-200"
            >
              <span className="bg-blue-600 text-white p-2 rounded-lg mr-2 shadow-sm">
                КРОН
              </span>
              <span className="text-gray-700">Маркет</span>
            </Link>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Ваш надежный поставщик строительных и отделочных материалов с 2010
              года
            </p>
          </div>

          {/* Каталог и навигация */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Каталог
            </h3>
            <ul className="grid grid-cols-1 gap-1">
              {mainCategories.map((category: Category) => (
                <li key={category.id} className="flex items-center">
                  <ChevronRightIcon className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-gray-600 hover:text-blue-600 transition-all duration-200 text-sm truncate py-1 px-1 rounded hover:bg-gray-50 flex-1 active:scale-95"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
              <li className="flex items-center mt-2 pt-2 border-t border-gray-100">
                <Link
                  href="/catalog"
                  className="text-blue-600 hover:text-blue-800 transition-all duration-200 text-sm font-medium flex items-center py-1 px-1 rounded hover:bg-blue-50 active:scale-95"
                >
                  Все товары
                  <ChevronRightIcon className="h-4 w-4 text-blue-600 ml-2 inline-flex items-center" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
              Информация
            </h3>
            <ul className="grid grid-cols-1 gap-1">
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <Link
                  href="/delivery"
                  className="text-gray-600 hover:text-green-600 transition-all duration-200 text-sm truncate py-1 px-1 rounded hover:bg-gray-50 flex-1 active:scale-95"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-green-600 transition-all duration-200 text-sm truncate py-1 px-1 rounded hover:bg-gray-50 flex-1 active:scale-95"
                >
                  О компании
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <Link
                  href="/contacts"
                  className="text-gray-600 hover:text-green-600 transition-all duration-200 text-sm truncate py-1 px-1 rounded hover:bg-gray-50 flex-1 active:scale-95"
                >
                  Контакты
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRightIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-green-600 transition-all duration-200 text-sm truncate py-1 px-1 rounded hover:bg-gray-50 flex-1 active:scale-95"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-amber-600 rounded-full mr-3"></span>
              Контакты
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <div className="bg-amber-50 p-2 rounded-lg mr-3 flex-shrink-0">
                  <PhoneIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <a
                    href="tel:+74957992666"
                    className="text-gray-900 hover:text-amber-600 transition-colors font-medium text-sm"
                  >
                    +7 (495) 799-26-66
                  </a>
                  <p className="text-gray-500 text-xs">Бесплатно по России</p>
                </div>
              </li>
              <li className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <div className="bg-amber-50 p-2 rounded-lg mr-3 flex-shrink-0">
                  <EnvelopeIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <a
                    href="mailto:info@tovari-kron.ru"
                    className="text-gray-900 hover:text-amber-600 transition-colors text-sm"
                  >
                    info@tovari-kron.ru
                  </a>
                </div>
              </li>
              <li className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <div className="bg-amber-50 p-2 rounded-lg mr-3 flex-shrink-0">
                  <ClockIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm font-medium">
                    Пн-Сб: 9:00 - 18:00
                  </p>
                  <p className="text-gray-500 text-xs">Вс: выходной</p>
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
