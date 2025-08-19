'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIES, GET_VIEWER, LOGOUT } from '@/lib/queries';
import {
  ChevronRightIcon,
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  InformationCircleIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Category } from '@/types/api';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  requiresAuth?: boolean;
}

export default function MenuPage() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first',
  });
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: 'cache-first',
  });
  const [logout] = useMutation(LOGOUT);

  const categories = categoriesData?.rootCategories || [];
  const user = userData?.viewer;

  useEffect(() => {
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

    checkAuth();
  }, [userData]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.data?.logOut?.__typename === 'LogOutSuccessResult') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('selectedRegion');
        localStorage.removeItem('guestToken');
        localStorage.removeItem('tokenRegionId');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Основное',
      items: [
        {
          id: 'catalog',
          title: 'Каталог товаров',
          href: '/catalog',
          icon: ShoppingBagIcon,
          description: 'Весь ассортимент товаров',
        },
      ],
    },
    ...(isLoggedIn
      ? [
          {
            title: 'Личный кабинет',
            items: [
              {
                id: 'profile',
                title: 'Мой профиль',
                href: '/profile',
                icon: UserIcon,
                description: 'Личная информация',
                requiresAuth: true,
              },
              {
                id: 'orders',
                title: 'Мои заказы',
                href: '/orders',
                icon: ClipboardDocumentListIcon,
                description: 'История покупок',
                requiresAuth: true,
              },
              {
                id: 'wishlist',
                title: 'Избранное',
                href: '/wishlist',
                icon: HeartIcon,
                description: 'Отложенные товары',
                requiresAuth: true,
              },
              {
                id: 'settings',
                title: 'Настройки',
                href: '/settings',
                icon: Cog6ToothIcon,
                description: 'Настройки аккаунта',
                requiresAuth: true,
              },
            ],
          },
        ]
      : []),
    {
      title: 'Информация',
      items: [
        {
          id: 'about',
          title: 'О компании',
          href: '/about',
          icon: BuildingStorefrontIcon,
          description: 'История и миссия',
        },
        {
          id: 'delivery',
          title: 'Доставка и оплата',
          href: '/delivery',
          icon: TruckIcon,
          description: 'Условия доставки',
        },
        {
          id: 'contacts',
          title: 'Контакты',
          href: '/contacts',
          icon: PhoneIcon,
          description: 'Связаться с нами',
        },
        {
          id: 'help',
          title: 'Помощь',
          href: '/help',
          icon: InformationCircleIcon,
          description: 'Часто задаваемые вопросы',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header с фиксированной высотой */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 z-10 shadow-sm">
        <div className="flex items-center h-16 px-4">
          <h1 className="text-xl font-bold text-gray-900">Меню</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* User Profile Section */}
        {isLoggedIn && user ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <UserIcon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {user.name || 'Пользователь'}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  {user.emailAddress}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center h-12 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 active:scale-[0.98] font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Войдите в аккаунт
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Получите доступ к заказам, избранному и персональным
                предложениям
              </p>
              <div className="flex space-x-3">
                <Link
                  href="/login"
                  className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center hover:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
                >
                  Регистрация
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between h-16 px-6 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <h2 className="text-lg font-semibold text-gray-900">Категории</h2>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                expandedSections.includes('categories') ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.includes('categories') && (
            <div className="border-t border-gray-100">
              {categories.map((category: Category, index: number) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`
                    flex items-center justify-between h-14 px-6 
                    hover:bg-gray-50 transition-colors duration-200
                    ${index !== categories.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {category.iconUrl && (
                      <Image
                        src={category.iconUrl}
                        alt={category.title}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                        unoptimized
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {category.title}
                    </span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-14 px-6 flex items-center border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>
            <div>
              {section.items.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center justify-between h-16 px-6 
                    hover:bg-gray-50 transition-colors duration-200
                    ${index !== section.items.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {item.badge && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-sm">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Мобильное приложение КРОН
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Скачайте наше приложение для удобных покупок
            </p>
            <div className="flex space-x-3">
              <Link
                href="https://apps.apple.com/ru/app/крон-интернет-магазин/id1611541742"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] text-sm"
              >
                App Store
              </Link>
              <Link
                href="https://www.rustore.ru/catalog/app/ru.tovarikron.android"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] text-sm"
              >
                RuStore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
