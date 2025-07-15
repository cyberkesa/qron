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
      className={`fixed right-4 md:right-6 p-2.5 bg-gradient-to-br from-blue-500/90 via-blue-600/90 to-blue-700/90 text-white rounded-full shadow-xl z-30
        transition-all duration-300 md:bottom-6
        scale-100 active:scale-95
        hover:shadow-2xl hover:brightness-110
        focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2
        border border-white/30
        ${isAnimating ? 'opacity-80' : 'hover:opacity-100'}
        animate-fade-in-up
      `}
      style={{
        bottom: getBottomPosition(),
        boxShadow:
          '0 4px 24px 0 rgba(37,99,235,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)',
      }}
      aria-label="Прокрутить вверх"
    >
      <span className="flex items-center justify-center">
        <ArrowUpIcon className="h-5 w-5 drop-shadow-[0_1px_4px_rgba(37,99,235,0.25)]" />
      </span>
    </button>
  );
}
