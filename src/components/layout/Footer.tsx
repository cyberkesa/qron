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
} from "@heroicons/react/24/outline";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data } = useQuery(GET_CATEGORIES);

  const categories = data?.rootCategories || [];

  return (
    <footer className="bg-gray-800 text-white min-h-[600px] w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-xl font-semibold mb-4">КРОН</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Ваш надежный поставщик строительных и отделочных материалов с
              доставкой по всей России. Работаем с 2010 года.
            </p>
          </div>

          {/* Каталог */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              {categories.map((category: Category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="text-blue-300 hover:text-white transition-colors text-sm"
                >
                  Все категории →
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/delivery"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link
                  href="/return"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Возврат и обмен
                </Link>
              </li>
              <li>
                <Link
                  href="/guarantee"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Гарантия
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  О компании
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Контакты
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-white font-medium">+7 (495) 799-26-66</p>
                  <p className="text-gray-400 text-xs">Бесплатно по России</p>
                </div>
              </li>
              <li className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <a
                    href="mailto:info@tovari-kron.ru"
                    className="text-white hover:text-blue-300 transition-colors"
                  >
                    info@tovari-kron.ru
                  </a>
                  <p className="text-gray-400 text-xs">
                    Для заказов и вопросов
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-white">
                    г. Москва, Домодедовское шоссе, 4-й километр, 15Б
                  </p>
                  <p className="text-gray-400 text-xs">Офис и пункт выдачи</p>
                </div>
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-white">Пн-Пт: 9:00 - 20:00</p>
                  <p className="text-white">Сб-Вс: 10:00 - 18:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть футера */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} ООО &laquo;КРОН&raquo;. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
