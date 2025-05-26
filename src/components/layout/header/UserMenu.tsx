'use client';

import Link from 'next/link';
import { memo } from 'react';

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
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-60 animate-zoom-in overflow-hidden">
        {/* Информация о пользователе */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {userInfo.name || 'Пользователь'}
          </p>
          <p className="text-xs text-gray-600 truncate mt-0.5">
            {userInfo.email}
          </p>
        </div>

        {/* Навигационные ссылки */}
        <div className="py-2">
          <Link
            href="/profile"
            className="flex items-center h-12 px-4 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium"
            onClick={onClose}
          >
            Личный кабинет
          </Link>
          <Link
            href="/profile/orders"
            className="flex items-center h-12 px-4 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium"
            onClick={onClose}
          >
            Мои заказы
          </Link>
          <Link
            href="/profile/addresses"
            className="flex items-center h-12 px-4 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium"
            onClick={onClose}
          >
            Мои адреса
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center h-12 px-4 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium"
            onClick={onClose}
          >
            Избранное
          </Link>
        </div>

        {/* Разделитель и кнопка выхода */}
        <div className="border-t border-gray-100">
          <button
            className="flex items-center w-full h-12 px-4 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
            onClick={onLogout}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }
);

UserMenu.displayName = 'UserMenu';

export default UserMenu;
