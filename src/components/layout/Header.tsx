"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CART, GET_VIEWER, GET_CATEGORIES, LOGOUT } from "@/lib/queries";
import SearchForm from "@/components/search/SearchForm";
import RegionSelector, {
  REGION_CONTACTS,
} from "@/components/region/RegionSelector";
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  TruckIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Category } from "@/types/api";
import { useCartContext } from "@/lib/providers/CartProvider";

// Мемоизированные компоненты для уменьшения ре-рендеров
const TopBar = memo(
  ({ regionContacts }: { regionContacts: typeof REGION_CONTACTS.MOSCOW }) => (
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
  ),
);

TopBar.displayName = "TopBar";

// Компонент для ссылки навигации в мобильном меню
const MobileNavLink = memo(
  ({
    href,
    active,
    onClick,
    children,
  }: {
    href: string;
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <li>
      <Link
        href={href}
        className={`block py-2 px-3 rounded-md ${
          active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
        }`}
        onClick={onClick}
      >
        {children}
      </Link>
    </li>
  ),
);

MobileNavLink.displayName = "MobileNavLink";

// Компонент для категорий в навигации
const CategoryNav = memo(({ categories }: { categories: Category[] }) => (
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
));

CategoryNav.displayName = "CategoryNav";

// Компонент меню пользователя
const UserMenu = memo(
  ({
    isOpen,
    userInfo,
    onClose,
    onLogout,
  }: {
    isOpen: boolean;
    userInfo: { name: string | undefined; email: string | undefined };
    onClose: () => void;
    onLogout: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200 animate-fade-in">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
          <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
        </div>
        <Link
          href="/profile"
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={onClose}
        >
          <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
          Мой профиль
        </Link>
        <Link
          href="/orders"
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={onClose}
        >
          <TruckIcon className="h-4 w-4 mr-2 text-gray-500" />
          Мои заказы
        </Link>
        <div className="border-t border-gray-100 my-1"></div>
<<<<<<< HEAD:src/components/layout/Header.tsx
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
=======
        <Link
          href="/profile"
          className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          onClick={onClose}
>>>>>>> 5ea25d4373053d38791cda8a10cf487bf24e1e7c:src/components/Header.tsx
        >
          <XMarkIcon className="h-4 w-4 mr-2" />
          Выйти
        </button>
      </div>
    );
  },
);

UserMenu.displayName = "UserMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [regionContacts, setRegionContacts] = useState(REGION_CONTACTS.MOSCOW);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: "cache-and-network",
  });
  const { data: userData } = useQuery(GET_VIEWER);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const [logout] = useMutation(LOGOUT);

  // Мемоизация данных для предотвращения ненужных рендеров
  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData],
  );

  const cartItemsCount = useMemo(
    () => cartData?.cart?.items?.edges?.length || 0,
    [cartData],
  );

  const userInfo = useMemo(
    () => ({
      name: userData?.viewer?.name,
      email: userData?.viewer?.emailAddress,
    }),
    [userData],
  );

  // Функции обработчиков событий
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.data?.logOut?.__typename === "LogOutSuccessResult") {
        // Очищаем все токены и данные
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("selectedRegion");
        localStorage.removeItem("guestToken");
        localStorage.removeItem("tokenRegionId");

        // Закрываем меню и перенаправляем на страницу входа
        handleCloseMenus();
        router.push("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Проверка авторизации и загрузка региона при монтировании
  useEffect(() => {
    // Проверка авторизации
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const guestToken = localStorage.getItem("guestToken");

      const isAuthenticated =
        !!accessToken &&
        !!refreshToken &&
        (!guestToken || accessToken !== guestToken);

      setIsLoggedIn(isAuthenticated);
    };

    // Загрузка региона и установка контактов
    const loadRegion = () => {
      if (typeof window !== "undefined") {
        const savedRegion = localStorage.getItem("selectedRegion");
        if (savedRegion) {
          try {
            const parsedRegion = JSON.parse(savedRegion);
            setRegionContacts(
              parsedRegion.name.includes("Ставрополь")
                ? REGION_CONTACTS.STAVROPOL
                : REGION_CONTACTS.MOSCOW,
            );
          } catch (e) {
            console.error("Ошибка при разборе сохраненного региона:", e);
          }
        }
      }
    };

    checkAuth();
    loadRegion();
  }, [userData]); // userData добавлен для обновления состояния при изменении данных пользователя

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Мемоизированные UI компоненты
  const authLinks = useMemo(() => {
    if (isLoggedIn) {
      return (
        <div id="user-menu" className="relative group" ref={profileMenuRef}>
          <button
            className="flex items-center text-gray-700 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleUserMenu}
          >
            <UserIcon className="w-6 h-6" />
            <span className="ml-1 hidden md:inline font-medium">
              {userInfo.name || "Профиль"}
            </span>
            <ChevronDownIcon className="h-4 w-4 ml-1 hidden md:inline" />
          </button>

          <UserMenu
            isOpen={isUserMenuOpen}
            userInfo={userInfo}
            onClose={handleCloseMenus}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
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
    );
  }, [
    isLoggedIn,
    isUserMenuOpen,
    userInfo,
    toggleUserMenu,
    handleCloseMenus,
    handleLogout,
  ]);

  const mobileMenu = useMemo(() => {
    if (!isMenuOpen) return null;

    return (
      <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-fade-in">
        <nav className="container mx-auto px-4 py-3">
          <ul className="space-y-3">
            <MobileNavLink
              href="/"
              active={pathname === "/"}
              onClick={handleCloseMenus}
            >
              Главная
            </MobileNavLink>
            <MobileNavLink
              href="/categories"
              active={pathname === "/categories"}
              onClick={handleCloseMenus}
            >
              Категории
            </MobileNavLink>

            {isLoggedIn ? (
              <>
                <MobileNavLink
                  href="/profile"
                  active={pathname === "/profile"}
                  onClick={handleCloseMenus}
                >
                  Профиль
                </MobileNavLink>
                <MobileNavLink
                  href="/orders"
                  active={pathname === "/orders"}
                  onClick={handleCloseMenus}
                >
                  Мои заказы
                </MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink
                  href="/login"
                  active={pathname === "/login"}
                  onClick={handleCloseMenus}
                >
                  Войти
                </MobileNavLink>
                <MobileNavLink
                  href="/register"
                  active={pathname === "/register"}
                  onClick={handleCloseMenus}
                >
                  Регистрация
                </MobileNavLink>
              </>
            )}

            <div className="border-t border-gray-200 mt-3 pt-2">
              <MobileNavLink
                href="/delivery"
                active={pathname === "/delivery"}
                onClick={handleCloseMenus}
              >
                Доставка
              </MobileNavLink>
            </div>
            <MobileNavLink
              href="/about"
              active={pathname === "/about"}
              onClick={handleCloseMenus}
            >
              О компании
            </MobileNavLink>
            <MobileNavLink
              href="/contacts"
              active={pathname === "/contacts"}
              onClick={handleCloseMenus}
            >
              Контакты
            </MobileNavLink>
          </ul>
        </nav>
      </div>
    );
  }, [isMenuOpen, pathname, isLoggedIn, handleCloseMenus]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      {/* Верхняя полоса с контактами */}
      <TopBar regionContacts={regionContacts} />

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
            {authLinks}

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
      {mobileMenu}

      {/* Навигация по категориям */}
      <CategoryNav categories={categories} />
    </header>
  );
}
