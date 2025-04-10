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
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Category } from "@/types/api";
import { useCartContext } from "@/lib/providers/CartProvider";

// Импортируем выделенные компоненты
import TopBar from "./header/TopBar";
import CategoryNav from "./header/CategoryNav";
import UserMenu from "./header/UserMenu";
import CartIndicator from "./header/CartIndicator";
import MobileMenu from "./header/MobileMenu";
import MobileNavLink from "./header/MobileNavLink";

// Компонент для главной части хедера с логотипом, поиском и корзиной
const MainHeader = memo(
  ({
    isLoggedIn,
    cartItemsCount,
    onToggleUserMenu,
    userInfo,
    authLinks,
    onToggleMenu,
  }: {
    isLoggedIn: boolean;
    cartItemsCount: number;
    onToggleUserMenu: () => void;
    userInfo: { name: string | undefined; email: string | undefined };
    authLinks: React.ReactNode;
    onToggleMenu: () => void;
  }) => (
    <div className="py-4 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Мобильная кнопка меню */}
          <button
            onClick={onToggleMenu}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md"
            aria-label="Открыть меню"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Логотип */}
          <Link href="/" className="flex-shrink-0 hover-scale">
            <h1 className="text-2xl font-bold text-blue-600">Qron Shop</h1>
          </Link>

          {/* Строка поиска - расширяется на всю доступную ширину */}
          <div className="flex-grow mx-6 max-w-2xl hidden md:block">
            <SearchForm />
          </div>

          {/* Иконки корзины и профиля */}
          <div className="flex items-center space-x-4">
            {/* Иконка корзины */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Кнопки авторизации */}
            {authLinks}
          </div>
        </div>

        {/* Мобильная строка поиска (видна только на мобильных) */}
        <div className="mt-4 md:hidden">
          <SearchForm />
        </div>
      </div>
    </div>
  ),
);

MainHeader.displayName = "MainHeader";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [regionContacts, setRegionContacts] = useState(REGION_CONTACTS.MOSCOW);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: "cache-and-network",
  });
  const { data: userData } = useQuery(GET_VIEWER);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const [logout] = useMutation(LOGOUT);
  const { cart: unifiedCart } = useCartContext();

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

  const handleLogout = useCallback(async () => {
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
  }, [logout, handleCloseMenus, router]); // Add all dependencies used inside the callback

  const toggleCategoryExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

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
      <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-fade-in-up">
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
              href="/catalog"
              active={pathname === "/catalog"}
              onClick={handleCloseMenus}
            >
              Каталог товаров
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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Верхняя плашка с регионом и контактами */}
      <TopBar regionContacts={regionContacts} />

      {/* Основная часть с логотипом, поиском, корзиной */}
      <MainHeader
        isLoggedIn={isLoggedIn}
        cartItemsCount={cartItemsCount}
        onToggleUserMenu={toggleUserMenu}
        userInfo={userInfo}
        authLinks={authLinks}
        onToggleMenu={toggleMenu}
      />

      {/* Навигация по категориям */}
      <CategoryNav categories={categories} />

      {/* Мобильное меню (отображается при открытии) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/50 animate-fade-in"
          onClick={handleCloseMenus}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white overflow-auto animate-fade-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-medium">Меню</h2>
              <button
                onClick={handleCloseMenus}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              <SearchForm />
            </div>

            <nav className="px-4 pb-6">
              {/* Основные ссылки */}
              <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                <Link
                  href="/catalog"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={handleCloseMenus}
                >
                  Каталог товаров
                </Link>
              </div>

              {/* Категории */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Категории
                </h3>
                <div className="space-y-1">
                  {categories.map((category: Category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block py-2 text-gray-700 hover:text-blue-600"
                      onClick={handleCloseMenus}
                    >
                      <div className="flex items-center">
                        {category.iconUrl && (
                          <Image
                            src={category.iconUrl}
                            alt={category.title}
                            width={16}
                            height={16}
                            className="mr-2"
                          />
                        )}
                        <span>{category.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {!isLoggedIn && (
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 text-center hover:bg-gray-50"
                    onClick={handleCloseMenus}
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700"
                    onClick={handleCloseMenus}
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
