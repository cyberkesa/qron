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
            <h3 className="text-xl font-semibold mb-4">КРОН Маркет</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Ваш надежный поставщик строительных и отделочных материалов с
              доставкой по всей России. Работаем с 2010 года.
            </p>
            <div className="flex mt-4 space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.0223 3.00001C20.1128 3.00001 21.0866 3.44 21.821 4.20846C22.5553 4.97693 23 5.93563 23 7.00001V17C23 18.0644 22.5553 19.0231 21.821 19.7915C21.0866 20.56 20.1128 21 19.0223 21H4.97768C3.88715 21 2.91333 20.56 2.17904 19.7915C1.44475 19.0231 1 18.0644 1 17V7.00001C1 5.93563 1.44475 4.97693 2.17904 4.20846C2.91333 3.44 3.88715 3.00001 4.97768 3.00001H19.0223ZM5.54077 6.9632H2.75V17C2.75 17.5967 2.97957 18.169 3.38856 18.591C3.79755 19.0129 4.37556 19.25 4.97768 19.25H19.0223C19.6244 19.25 20.2024 19.0129 20.6114 18.591C21.0204 18.169 21.25 17.5967 21.25 17V6.9632H18.4592C18.6442 7.51573 18.7414 8.10179 18.7414 8.6991C18.7414 10.2347 18.1553 11.7072 17.1032 12.792C16.051 13.8769 14.6204 14.4815 13.1216 14.4815C11.6229 14.4815 10.1922 13.8769 9.14009 12.792C8.08794 11.7072 7.50185 10.2347 7.50185 8.6991C7.50185 8.10179 7.59901 7.51573 7.78399 6.9632H5.54077ZM13.1216 5.35201C12.1203 5.35201 11.1604 5.756 10.4494 6.4748C9.73834 7.19359 9.33642 8.1643 9.33642 9.17601C9.33642 10.1877 9.73834 11.1584 10.4494 11.8772C11.1604 12.596 12.1203 13 13.1216 13C14.1229 13 15.0829 12.596 15.7939 11.8772C16.5049 11.1584 16.9068 10.1877 16.9068 9.17601C16.9068 8.1643 16.5049 7.19359 15.7939 6.4748C15.0829 5.756 14.1229 5.35201 13.1216 5.35201ZM18.1525 5.15001H16.3179V7.00001H18.1525V5.15001Z" />
                </svg>
              </a>
            </div>
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
                  <p className="text-white font-medium">8 800 555-35-35</p>
                  <p className="text-gray-400 text-xs">Бесплатно по России</p>
                </div>
              </li>
              <li className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <a
                    href="mailto:info@kron-market.ru"
                    className="text-white hover:text-blue-300 transition-colors"
                  >
                    info@kron-market.ru
                  </a>
                  <p className="text-gray-400 text-xs">
                    Для заказов и вопросов
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-white">г. Москва, ул. Строителей, 15</p>
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
            © {currentYear} КРОН Маркет. Все права защищены.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-gray-400 text-sm">Способы оплаты:</span>
            <div className="flex space-x-2">
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <svg
                  className="h-4"
                  viewBox="0 0 38 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                    fill="#fff"
                  />
                  <path
                    d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                    fill="#fff"
                  />
                  <path
                    d="M15 19h2v-2h-2v2zm-4 0h2v-2h-2v2zm6-8h2V9h-2v2zm-4 0h2V9h-2v2zm12-4h-2v2h2V7zm-4 0h-2v2h2V7z"
                    fill="#2557D6"
                  />
                  <path d="M26 19h2v-2h-2v2zm-6-8h2V9h-2v2z" fill="#E21836" />
                  <path d="M15 7h-2v2h2V7z" fill="#1A1F71" />
                  <path
                    d="M22 7h-3v2h3V7zm0 8h-3v2h3v-2zm0-4h-3v2h3v-2zm-8 4h-3v2h3v-2zm0-4h-3v2h3v-2z"
                    fill="#F9A533"
                  />
                </svg>
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <svg
                  className="h-4"
                  viewBox="0 0 38 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                    fill="#fff"
                  />
                  <path
                    d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                    fill="#fff"
                  />
                  <circle fill="#EB001B" cx="15" cy="12" r="7" />
                  <circle fill="#F79E1B" cx="23" cy="12" r="7" />
                  <path
                    d="M23 5c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 13c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"
                    fill="#FF5F00"
                  />
                  <path
                    d="M19 12c0-1.7.7-3.2 1.8-4.2-2-1.8-5-1.7-6.8.3-1.8 2-1.7 5 .3 6.8 1.8 1.6 4.5 1.6 6.3 0-1.1-1-1.6-2.5-1.6-4.2z"
                    fill="#EB001B"
                  />
                </svg>
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <svg
                  className="h-3"
                  viewBox="0 0 780 501"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40 0h700c22 0 40 18 40 40v421c0 22-18 40-40 40H40c-22 0-40-18-40-40V40C0 18 18 0 40 0z"
                    fill="#fff"
                  />
                  <path
                    d="M415 144c35 0 64 28 64 63v85c0 13-6 25-15 34-9 9-22 15-35 15h-72v-35h72V182h-72v142h-35V182h-72v124h72v35h-72c-13 0-25-6-34-15-9-9-15-21-15-34v-85c0-35 29-63 64-63h73z"
                    fill="#4DB45E"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
