'use client';

import { memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Category } from '@/types/api';
import MobileNavLink from './MobileNavLink';

interface MobileMenuProps {
  isOpen: boolean;
  currentPath: string;
  categories: Category[];
  onClose: () => void;
  isAuthenticated: boolean;
}

// Компонент мобильного меню
const MobileMenu = memo(
  ({
    isOpen,
    currentPath,
    categories,
    onClose,
    isAuthenticated,
  }: MobileMenuProps) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        {/* Header с фиксированной высотой */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <h2 className="text-xl font-semibold text-gray-900">Меню</h2>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 active:scale-95"
              onClick={onClose}
              aria-label="Закрыть меню"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Контент меню */}
        <div className="px-4 py-6">
          <nav>
            <ul className="space-y-2">
              {/* Основные разделы */}
              <MobileNavLink
                href="/"
                active={currentPath === '/'}
                onClick={onClose}
              >
                Главная
              </MobileNavLink>
              <MobileNavLink
                href="/catalog"
                active={currentPath === '/catalog'}
                onClick={onClose}
              >
                Каталог
              </MobileNavLink>

              {/* Разделитель и заголовок категорий */}
              <li className="pt-8 pb-4">
                <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="px-4 text-sm font-medium text-gray-500 bg-white">
                    Категории
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </li>

              {/* Категории */}
              {categories.map((category) => (
                <MobileNavLink
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  active={currentPath === `/categories/${category.slug}`}
                  onClick={onClose}
                >
                  {category.title}
                </MobileNavLink>
              ))}

              {/* Разделитель и заголовок информации */}
              <li className="pt-8 pb-4">
                <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="px-4 text-sm font-medium text-gray-500 bg-white">
                    Информация
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </li>

              {/* Информационные разделы */}
              <MobileNavLink
                href="/delivery"
                active={currentPath === '/delivery'}
                onClick={onClose}
              >
                Доставка
              </MobileNavLink>
              <MobileNavLink
                href="/about"
                active={currentPath === '/about'}
                onClick={onClose}
              >
                О компании
              </MobileNavLink>
              <MobileNavLink
                href="/contacts"
                active={currentPath === '/contacts'}
                onClick={onClose}
              >
                Контакты
              </MobileNavLink>

              {/* Личный кабинет (только для авторизованных) */}
              {isAuthenticated && (
                <>
                  <li className="pt-8 pb-4">
                    <div className="flex items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="px-4 text-sm font-medium text-gray-500 bg-white">
                        Личный кабинет
                      </span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                  </li>
                  <MobileNavLink
                    href="/profile"
                    active={currentPath === '/profile'}
                    onClick={onClose}
                  >
                    Мой профиль
                  </MobileNavLink>
                  <MobileNavLink
                    href="/orders"
                    active={currentPath === '/orders'}
                    onClick={onClose}
                  >
                    Мои заказы
                  </MobileNavLink>
                  <MobileNavLink
                    href="/wishlist"
                    active={currentPath === '/wishlist'}
                    onClick={onClose}
                  >
                    Избранное
                  </MobileNavLink>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Отступ снизу для безопасной области */}
        <div className="pb-safe h-20"></div>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

export default MobileMenu;
