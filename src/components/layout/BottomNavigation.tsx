'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_CART, GET_VIEWER } from '@/lib/queries';
import {
  HomeIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  UserIcon as UserIconSolid,
  Bars3Icon as Bars3IconSolid,
} from '@heroicons/react/24/solid';

interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: (pathname: string) => boolean;
}

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Получаем данные корзины и пользователя
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: 'cache-first',
  });

  const cartItemsCount = cartData?.cart?.items?.edges?.length || 0;
  const isLoggedIn = !!userData?.viewer;

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Навигационные элементы
  const navItems: BottomNavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      isActive: (path) => path === '/',
    },
    {
      id: 'catalog',
      label: 'Каталог',
      href: '/catalog',
      icon: Squares2X2Icon,
      iconSolid: Squares2X2IconSolid,
      isActive: (path) =>
        path.startsWith('/catalog') || path.startsWith('/categories'),
    },
    {
      id: 'cart',
      label: 'Корзина',
      href: '/cart',
      icon: ShoppingCartIcon,
      iconSolid: ShoppingCartIconSolid,
      badge: cartItemsCount,
      isActive: (path) => path.startsWith('/cart'),
    },
    {
      id: 'profile',
      label: isLoggedIn ? 'Профиль' : 'Войти',
      href: isLoggedIn ? '/profile' : '/login',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      isActive: (path) =>
        path.startsWith('/profile') ||
        path.startsWith('/login') ||
        path.startsWith('/register'),
    },
    {
      id: 'menu',
      label: 'Меню',
      href: '/menu',
      icon: Bars3Icon,
      iconSolid: Bars3IconSolid,
      isActive: (path) => path.startsWith('/menu'),
    },
  ];

  // Не показываем на десктопе
  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-[0_-2px_8px_rgba(0,0,0,0.15)] md:hidden">
        {/* Контейнер навигации */}
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = item.isActive
              ? item.isActive(pathname || '')
              : pathname === item.href;
            const IconComponent = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center 
                  min-w-0 flex-1 h-12 mx-1 rounded-lg
                  transition-all duration-150 ease-out
                  touch-manipulation
                  ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {/* Иконка с бейджем */}
                <div className="relative flex items-center justify-center">
                  <IconComponent className="h-6 w-6" />

                  {/* Badge для корзины */}
                  {item.badge && item.badge > 0 && (
                    <span
                      className="
                      absolute -top-2 -right-2 
                      bg-gray-800 text-white text-xs 
                      min-w-[18px] h-[18px] px-1
                      flex items-center justify-center 
                      rounded-full font-medium
                      border border-white
                    "
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Текст */}
                <span
                  className={`
                  text-[10px] leading-tight font-medium mt-0.5
                  truncate max-w-full mobile-nav-text
                  ${isActive ? 'text-gray-900' : 'text-gray-500'}
                `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
