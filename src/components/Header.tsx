"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CART, GET_VIEWER, GET_CATEGORIES } from "@/lib/queries";
import SearchForm from "./SearchForm";
import RegionSelector, { REGION_CONTACTS } from "./RegionSelector";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Category } from "@/types/api";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [regionContacts, setRegionContacts] = useState(REGION_CONTACTS.MOSCOW);
  const router = useRouter();
  const pathname = usePathname();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: cartData } = useQuery(GET_CART);
  const { data: userData } = useQuery(GET_VIEWER);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const categories = categoriesData?.rootCategories || [];

  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const guestToken = localStorage.getItem("guestToken");

    // Пользователь считается авторизованным, если у него есть accessToken и refreshToken,
    // но при этом accessToken не является guestToken
    const isAuthenticated =
      !!accessToken &&
      !!refreshToken &&
      (!guestToken || accessToken !== guestToken);

    setIsLoggedIn(isAuthenticated);
  }, [userData]);

  // Проверяем выбранный регион при загрузке и обновляем контакты
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRegion = localStorage.getItem("selectedRegion");
      if (savedRegion) {
        try {
          const parsedRegion = JSON.parse(savedRegion);
          setRegionContacts(
            parsedRegion.name.includes("Ставрополь")
              ? REGION_CONTACTS.STAVROPOL
              : REGION_CONTACTS.MOSCOW
          );
        } catch (e) {
          console.error("Ошибка при разборе сохраненного региона:", e);
        }
      }
    }
  }, []);

  const cartItemsCount = cartData?.cart?.items?.edges?.length || 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleCloseMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Закрываем меню при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById("user-menu");
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [profileMenuRef]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      {/* Верхняя полоса с контактами */}
      <div className="bg-gray-50 py-2 text-xs border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <RegionSelector />

            <a
              href={regionContacts.phoneLink}
              className="text-gray-600 hover:text-blue-600 flex items-center"
            >
              <PhoneIcon className="h-3.5 w-3.5 mr-1" />
              <span>{regionContacts.phone}</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/delivery"
              className="text-gray-600 hover:text-blue-600 flex items-center"
            >
              <TruckIcon className="h-3.5 w-3.5 mr-1" />
              <span>Доставка</span>
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-600 flex items-center"
            >
              <InformationCircleIcon className="h-3.5 w-3.5 mr-1" />
              <span>О компании</span>
            </Link>
            <Link
              href="/contacts"
              className="text-gray-600 hover:text-blue-600 flex items-center"
            >
              <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
              <span>Контакты</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Основной хедер */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 mr-2 flex items-center"
              onClick={handleCloseMenus}
            >
              <span className="bg-blue-600 text-white p-1 rounded mr-1">
                КРОН
              </span>
              <span className="text-gray-700">Маркет</span>
            </Link>
          </div>

          {/* Поиск на десктопе */}
          <div className="hidden md:block flex-grow mx-8 max-w-2xl">
            <SearchForm />
          </div>

          {/* Кнопки пользователя */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {isLoggedIn ? (
              <div id="user-menu" className="relative group">
                <button
                  className="flex items-center text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={toggleUserMenu}
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="ml-1 hidden md:inline font-medium">
                    {userData?.viewer?.name || "Профиль"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 ml-1 hidden md:inline" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userData?.viewer?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userData?.viewer?.emailAddress}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleCloseMenus}
                    >
                      <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                      Мой профиль
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={handleCloseMenus}
                    >
                      <TruckIcon className="h-4 w-4 mr-2 text-gray-500" />
                      Мои заказы
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      onClick={handleCloseMenus}
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Выйти
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/login"
                  className="flex items-center text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={handleCloseMenus}
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="ml-1 hidden md:inline">Войти</span>
                </Link>

                <Link
                  href="/register"
                  className="ml-2 hidden md:block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleCloseMenus}
                >
                  Регистрация
                </Link>
              </div>
            )}

            <Link
              href="/cart"
              className="relative flex items-center text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleCloseMenus}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="ml-1 hidden md:inline">Корзина</span>
            </Link>

            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Поиск на мобильных */}
        <div className={`mt-4 md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <SearchForm />
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className={`block py-2 px-3 rounded-md ${
                    pathname === "/"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={handleCloseMenus}
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`block py-2 px-3 rounded-md ${
                    pathname === "/categories"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={handleCloseMenus}
                >
                  Категории
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className={`block py-2 px-3 rounded-md ${
                        pathname === "/profile"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={handleCloseMenus}
                    >
                      Профиль
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className={`block py-2 px-3 rounded-md ${
                        pathname === "/orders"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={handleCloseMenus}
                    >
                      Мои заказы
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className={`block py-2 px-3 rounded-md ${
                        pathname === "/login"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={handleCloseMenus}
                    >
                      Войти
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className={`block py-2 px-3 rounded-md ${
                        pathname === "/register"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={handleCloseMenus}
                    >
                      Регистрация
                    </Link>
                  </li>
                </>
              )}
              <li className="border-t border-gray-200 pt-2">
                <Link
                  href="/delivery"
                  className={`block py-2 px-3 rounded-md ${
                    pathname === "/delivery"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={handleCloseMenus}
                >
                  Доставка
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={`block py-2 px-3 rounded-md ${
                    pathname === "/about"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={handleCloseMenus}
                >
                  О компании
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className={`block py-2 px-3 rounded-md ${
                    pathname === "/contacts"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={handleCloseMenus}
                >
                  Контакты
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Навигация по категориям */}
      <div className="hidden md:block bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-6 text-sm py-2 overflow-x-auto">
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 py-2 whitespace-nowrap"
            >
              Все категории
            </Link>
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-gray-700 hover:text-blue-600 py-2 whitespace-nowrap flex items-center"
              >
                {category.iconUrl && (
                  <Image
                    src={category.iconUrl}
                    alt={category.title}
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                )}
                {category.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
