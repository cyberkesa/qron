'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  lazy,
  Suspense,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CART, GET_VIEWER, GET_CATEGORIES, LOGOUT } from '@/lib/queries';
import SearchForm from '@/components/search/SearchForm';
import RegionSelector, {
  REGION_CONTACTS,
} from '@/components/region/RegionSelector';
import {
  UserIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { Category } from '@/types/api';
import { useCartContext } from '@/lib/providers/CartProvider';

// Импортируем выделенные компоненты
import TopBar from './header/TopBar';
import CategoryNav from './header/CategoryNav';

// Lazy load components that aren't immediately visible
const LazyUserMenu = lazy(() => import('./header/UserMenu'));

// Компонент для главной части хедера с логотипом, поиском и корзиной
const MainHeader = memo(
  ({
    isLoggedIn,
    cartItemsCount,
    onToggleUserMenu,
    userInfo,
    authLinks,
  }: {
    isLoggedIn: boolean;
    cartItemsCount: number;
    onToggleUserMenu: () => void;
    userInfo: { name: string | undefined; email: string | undefined };
    authLinks: React.ReactNode;
  }) => (
    <>
      {/* Основная строка хедера */}
      <div className="bg-white border-b border-gray-200">
        <div className="header-container header-padding">
          <div className="flex items-center justify-between h-12 md:h-16">
            {/* Логотип - центрируем на мобильных */}
            <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
              <Link
                href="/"
                className="flex-shrink-0 hover:scale-105 transition-transform duration-200 active:scale-95"
              >
                <h1 className="text-xl md:text-2xl font-bold text-blue-600 tracking-tight mobile-header-logo">
                  КРОН
                </h1>
              </Link>
            </div>

            {/* Строка поиска - только на десктопе */}
            <div className="hidden md:flex flex-grow mx-6 max-w-2xl">
              <SearchForm />
            </div>

            {/* Иконки корзины и профиля - только на десктопе */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Иконка корзины */}
              <Link
                href="/cart"
                className="relative p-2.5 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-gray-50 active:scale-95"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full font-semibold border-2 border-white shadow-sm">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Кнопки авторизации */}
              {authLinks}
            </div>
          </div>
        </div>
      </div>

      {/* Мобильная строка поиска */}
      <div className="md:hidden bg-gray-50/50 border-b border-gray-100">
        <div className="header-container header-padding py-2">
          <SearchForm />
        </div>
      </div>
    </>
  )
);

MainHeader.displayName = 'MainHeader';

export default memo(function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [regionContacts, setRegionContacts] = useState(REGION_CONTACTS.MOSCOW);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Use fetchPolicy: "cache-first" for data that doesn't change often during a session
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: 'cache-first',
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first',
  });
  const [logout] = useMutation(LOGOUT);
  const { cart: unifiedCart } = useCartContext();

  // Memoized data to prevent unnecessary renders
  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData]
  );

  const cartItemsCount = useMemo(
    () => cartData?.cart?.items?.edges?.length || 0,
    [cartData]
  );

  const userInfo = useMemo(
    () => ({
      name: userData?.viewer?.name,
      email: userData?.viewer?.emailAddress,
    }),
    [userData]
  );

  // Event handler functions
  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const handleCloseMenus = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout();
      if (result.data?.logOut?.__typename === 'LogOutSuccessResult') {
        // Clear all tokens and data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('selectedRegion');
        localStorage.removeItem('guestToken');
        localStorage.removeItem('tokenRegionId');

        // Close menus and redirect to login page
        handleCloseMenus();
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logout, handleCloseMenus, router]);

  // Проверка авторизации и загрузка региона при монтировании
  useEffect(() => {
    // Проверка авторизации
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const guestToken = localStorage.getItem('guestToken');

      const isAuthenticated =
        !!accessToken &&
        !!refreshToken &&
        (!guestToken || accessToken !== guestToken);

      setIsLoggedIn(isAuthenticated);
    };

    // Загрузка региона и установка контактов
    const loadRegion = () => {
      if (typeof window !== 'undefined') {
        const savedRegion = localStorage.getItem('selectedRegion');
        if (savedRegion) {
          try {
            const parsedRegion = JSON.parse(savedRegion);
            setRegionContacts(
              parsedRegion.name.includes('Ставрополь')
                ? REGION_CONTACTS.STAVROPOL
                : REGION_CONTACTS.MOSCOW
            );
          } catch (e) {
            console.error('Ошибка при разборе сохраненного региона:', e);
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

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
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
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <UserIcon className="w-6 h-6" />
            <span className="ml-1 hidden md:inline font-medium">
              {userInfo.name || 'Профиль'}
            </span>
            <ChevronDownIcon className="h-4 w-4 ml-1 hidden md:inline" />
          </button>

          {isUserMenuOpen && (
            <Suspense
              fallback={
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 opacity-75">
                  Loading...
                </div>
              }
            >
              <LazyUserMenu
                isOpen={isUserMenuOpen}
                userInfo={userInfo}
                onClose={handleCloseMenus}
                onLogout={handleLogout}
              />
            </Suspense>
          )}
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

  return (
    <header className="sticky top-0 z-[1000] bg-white shadow-sm">
      {/* Top bar with region and contacts */}
      <TopBar regionContacts={regionContacts} />

      {/* Main part with logo, search, cart */}
      <MainHeader
        isLoggedIn={isLoggedIn}
        cartItemsCount={cartItemsCount}
        onToggleUserMenu={toggleUserMenu}
        userInfo={userInfo}
        authLinks={authLinks}
      />

      {/* Navigation by categories */}
      <CategoryNav categories={categories} />
    </header>
  );
});
