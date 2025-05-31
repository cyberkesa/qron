'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  // Проверяем, есть ли мобильная панель товара
  const isProductPage = pathname?.startsWith('/product/');

  // Определяем позицию кнопки в зависимости от контекста
  const getBottomPosition = () => {
    if (isProductPage) {
      // На странице товара: отступ от мобильной панели товара + мобильное меню
      return 'calc(9rem + env(safe-area-inset-bottom))';
    } else {
      // На других страницах: отступ только от мобильного меню
      return 'calc(5rem + env(safe-area-inset-bottom))';
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      const scrollY = window.scrollY;
      // Показываем кнопку когда скролл больше 300px
      const shouldShow = scrollY > 300;

      if (shouldShow !== isVisible) {
        setIsVisible(shouldShow);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [isVisible]);

  const scrollToTop = () => {
    setIsAnimating(true);

    // Плавный скролл с анимацией
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Сбрасываем анимацию когда скролл закончен
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-md z-30 transition-all duration-200 md:bottom-6 ${
        isAnimating ? 'opacity-70' : 'hover:shadow-lg'
      }`}
      style={{ bottom: getBottomPosition() }}
      aria-label="Прокрутить вверх"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
