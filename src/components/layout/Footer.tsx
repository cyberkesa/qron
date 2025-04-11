"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "@/lib/queries";
import { Category } from "@/types/api";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data } = useQuery(GET_CATEGORIES);

  // Определяем основные категории (максимум 6)
  const mainCategories = (data?.rootCategories || []).slice(0, 6);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-700 w-full">
      {/* Основная часть футера */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="flex space-x-3 mt-4">
              <a
                href="#"
                className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                aria-label="Вконтакте"
              >
                <svg
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 16.611h-1.616c-.608 0-.792-.512-1.888-1.616-1-.9-1.454-.96-1.704-.96-.344 0-.432.096-.432.584v1.488c0 .416-.136.584-1.264.584-1.843 0-3.912-1.128-5.356-3.228C5.287 10.281 4.683 8.078 4.683 7.664c0-.264.104-.512.584-.512h1.616c.44 0 .608.216.776.72.856 2.46 2.296 4.604 2.888 4.604.224 0 .328-.104.328-.672V9.2c-.072-1.2-.696-1.296-.696-1.72 0-.2.168-.4.44-.4h2.552c.344 0 .464.184.464.584v3.112c0 .344.12.464.208.464.224 0 .4-.12.824-.52.984-1.104 1.704-2.808 1.704-2.808.096-.2.256-.388.656-.388h1.616c.488 0 .584.248.488.536-.2.88-2.144 3.688-2.144 3.688-.168.28-.224.4 0 .704.168.2.704.616 1.048 1 .96.896 1.648 1.656 1.848 2.184.176.504-.12.76-.568.76z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                aria-label="Телеграм"
              >
                <svg
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228.008-.024.008-.048.008-.072 0-.084-.048-.12-.132-.084-.072.024-1.416.9-4.016 2.64-.38.264-.72.384-1.02.372-.336-.012-1.32-.42-1.32-.42-.6-.192-.444-.6.24-.9 0 0 3.816-1.74 5.4-2.376.972-.42 2.508-1.08 2.868-1.116.72-.096 1.308-.072 1.488.408.096.216.108.54.072.84z" />
                </svg>
              </a>
              <a
                href="#"
                className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="h-5 w-5 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Каталог и навигация */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-800">
              Каталог
            </h3>
            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-y-1">
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
              <li className="md:col-span-2 flex items-center">
                <Link
                  href="/catalog"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center"
                >
                  Все товары
                  <ChevronRightIcon className="h-3 w-3 ml-1" />
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
              <li className="flex items-start">
                <PhoneIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
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
              <li className="flex items-start">
                <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <a
                    href="mailto:info@tovari-kron.ru"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    info@tovari-kron.ru
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
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
          <p className="text-gray-500 text-xs mb-2 md:mb-0">
            © {currentYear} ООО &laquo;КРОН&raquo;. Все права защищены
          </p>
          <div className="flex space-x-4 text-xs text-gray-500">
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
