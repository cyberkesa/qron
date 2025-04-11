"use client";

import { memo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/api";
import MobileNavLink from "./MobileNavLink";

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Меню</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav>
            <ul className="space-y-2">
              <MobileNavLink
                href="/"
                active={currentPath === "/"}
                onClick={onClose}
              >
                Главная
              </MobileNavLink>
              <MobileNavLink
                href="/catalog"
                active={currentPath === "/catalog"}
                onClick={onClose}
              >
                Каталог
              </MobileNavLink>

              <li className="mt-4 mb-2">
                <h3 className="text-sm font-medium text-gray-500 px-3">
                  Категории
                </h3>
              </li>
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

              <li className="border-t border-gray-200 my-4 pt-4">
                <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">
                  Информация
                </h3>
              </li>
              <MobileNavLink
                href="/delivery"
                active={currentPath === "/delivery"}
                onClick={onClose}
              >
                Доставка
              </MobileNavLink>
              <MobileNavLink
                href="/about"
                active={currentPath === "/about"}
                onClick={onClose}
              >
                О компании
              </MobileNavLink>
              <MobileNavLink
                href="/contacts"
                active={currentPath === "/contacts"}
                onClick={onClose}
              >
                Контакты
              </MobileNavLink>

              {isAuthenticated && (
                <>
                  <li className="border-t border-gray-200 my-4 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">
                      Личный кабинет
                    </h3>
                  </li>
                  <MobileNavLink
                    href="/profile"
                    active={currentPath === "/profile"}
                    onClick={onClose}
                  >
                    Мой профиль
                  </MobileNavLink>
                  <MobileNavLink
                    href="/orders"
                    active={currentPath === "/orders"}
                    onClick={onClose}
                  >
                    Мои заказы
                  </MobileNavLink>
                  <MobileNavLink
                    href="/wishlist"
                    active={currentPath === "/wishlist"}
                    onClick={onClose}
                  >
                    Избранное
                  </MobileNavLink>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    );
  },
);

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;
