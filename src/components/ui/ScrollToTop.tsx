'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      className={`fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50 transition-all duration-300 ${
        isAnimating ? 'animate-bounce' : 'hover:transform hover:scale-110'
      } hover-lift`}
      aria-label="Прокрутить вверх"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
