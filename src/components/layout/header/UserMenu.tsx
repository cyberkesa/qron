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
      <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-60 animate-zoom-in border border-gray-200">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
          <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
        </div>
        <Link
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
          onClick={onClose}
        >
          Личный кабинет
        </Link>
        <Link
          href="/profile/orders"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
          onClick={onClose}
        >
          Мои заказы
        </Link>
        <Link
          href="/profile/addresses"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
          onClick={onClose}
        >
          Мои адреса
        </Link>
        <div className="border-t border-gray-100 my-1"></div>
        <button
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          onClick={onLogout}
        >
          Выйти
        </button>
      </div>
    );
  }
);

UserMenu.displayName = 'UserMenu';

export default UserMenu;
