'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_VIEWER, LOGOUT } from '@/lib/queries';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  UserIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutMessage, setLogoutMessage] = useState('');

  const { data, loading, error } = useQuery(GET_VIEWER);
  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.data?.logOut?.__typename === 'LogOutSuccessResult') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('guestToken');
        localStorage.removeItem('tokenRegionId');
        setLogoutMessage('Вы успешно вышли из аккаунта');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        setLogoutMessage('Ошибка: не удалось выйти из аккаунта');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при выходе из аккаунта';
      setLogoutMessage(`Ошибка: ${errorMessage}`);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Breadcrumbs setup
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Главная', path: '/' },
      { label: 'Личный кабинет', path: '/profile' },
    ];

    if (pathname && pathname.includes('/profile/orders')) {
      items.push({ label: 'Мои заказы', path: '/profile/orders' });
    } else if (pathname && pathname.includes('/profile/addresses')) {
      items.push({ label: 'Мои адреса', path: '/profile/addresses' });

      if (pathname && pathname.includes('/new')) {
        items.push({
          label: 'Добавление адреса',
          path: '/profile/addresses/new',
        });
      } else if (pathname && pathname.includes('/edit')) {
        items.push({ label: 'Редактирование адреса', path: pathname });
      }
    } else if (pathname && pathname.includes('/profile/edit')) {
      items.push({ label: 'Редактирование профиля', path: '/profile/edit' });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (error) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
          {error.message || 'Произошла ошибка при загрузке профиля'}
        </div>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors active:scale-[0.98]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Войти в аккаунт
          </Link>
        </div>
      </main>
    );
  }

  const user = data?.viewer;

  if (!user && !loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
          Вы не авторизованы
        </div>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors active:scale-[0.98]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Войти в аккаунт
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="ml-4 text-blue-600">Загрузка...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-4 text-sm">
        {breadcrumbItems.map((item, index) => (
          <div key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {index === breadcrumbItems.length - 1 ? (
              <span className="text-gray-500">{item.label}</span>
            ) : (
              <Link
                href={item.path}
                className="text-gray-700 hover:text-blue-700 transition-colors duration-200"
              >
                {index === 0 ? (
                  <div className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-1" />
                    {item.label}
                  </div>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </div>
        ))}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Личный кабинет
      </h1>

      {logoutMessage && (
        <div
          className={`px-4 py-3 rounded-lg mb-6 ${
            logoutMessage.startsWith('Ошибка:')
              ? 'bg-red-50 border border-red-100 text-red-700'
              : 'bg-green-50 border border-green-100 text-green-700'
          }`}
        >
          {logoutMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with navigation */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-md">
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[180px]">
                    {user.emailAddress}
                  </div>
                </div>
              </div>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/profile"
                    className={`flex items-center ${
                      isActive('/profile')
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-200 rounded-lg p-3`}
                  >
                    <UserIcon
                      className={`w-5 h-5 mr-3 ${isActive('/profile') ? '' : 'text-gray-500'}`}
                    />
                    <span className={isActive('/profile') ? 'font-medium' : ''}>
                      Личные данные
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/orders"
                    className={`flex items-center ${
                      isActive('/profile/orders')
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-200 rounded-lg p-3`}
                  >
                    <ShoppingBagIcon
                      className={`w-5 h-5 mr-3 ${isActive('/profile/orders') ? '' : 'text-gray-500'}`}
                    />
                    <span
                      className={
                        isActive('/profile/orders') ? 'font-medium' : ''
                      }
                    >
                      Мои заказы
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/addresses"
                    className={`flex items-center ${
                      pathname && pathname.includes('/profile/addresses')
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-200 rounded-lg p-3`}
                  >
                    <MapPinIcon
                      className={`w-5 h-5 mr-3 ${
                        pathname && pathname.includes('/profile/addresses')
                          ? ''
                          : 'text-gray-500'
                      }`}
                    />
                    <span
                      className={
                        pathname && pathname.includes('/profile/addresses')
                          ? 'font-medium'
                          : ''
                      }
                    >
                      Мои адреса
                    </span>
                  </Link>
                </li>
                <li className="pt-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex items-center w-full text-left text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg p-3"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    <span>
                      {logoutLoading ? 'Выход...' : 'Выйти из аккаунта'}
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </main>
  );
}
