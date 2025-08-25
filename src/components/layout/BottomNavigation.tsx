'use client';

import React from 'react';
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
import ThemeToggle from '@/components/ui/ThemeToggle';

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

  // Получаем данные корзины и пользователя
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: 'cache-first',
  });

  const cartItemsCount = cartData?.cart?.items?.edges?.length || 0;
  const isLoggedIn = !!userData?.viewer;

  // Mobile-first: рендер управляется через CSS (md:hidden)

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

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
        {/* Контейнер навигации */}
        <div className="flex items-center justify-around h-14 sm:h-16 px-1.5 sm:px-2 pb-safe">
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
                  min-w-0 flex-1 h-12 sm:h-12 mx-0.5 sm:mx-1 rounded-md
                  transition-all duration-150 ease-out
                  touch-manipulation
                  ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Иконка с бейджем */}
                <div className="relative flex items-center justify-center">
                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />

                  {/* Badge для корзины */}
                  {item.badge && item.badge > 0 && (
                    <span
                      className="
                      absolute -top-1.5 -right-1.5 
                      bg-gray-800 text-white text-[10px] sm:text-xs 
                      min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1
                      flex items-center justify-center 
                      rounded-full font-semibold
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
                  text-[11px] sm:text-[10px] leading-tight font-medium mt-0.5
                  truncate max-w-full mobile-nav-text
                  ${isActive ? 'text-gray-900' : 'text-gray-500'}
                `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <div className="flex-1 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
