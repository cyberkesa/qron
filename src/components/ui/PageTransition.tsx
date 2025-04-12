'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPathname, setCurrentPathname] = useState(pathname);
  const [content, setContent] = useState(children);

  // Обрабатываем изменение маршрута
  useEffect(() => {
    // Если путь изменился, запускаем анимацию исчезновения
    if (pathname !== currentPathname) {
      setIsVisible(false);

      // После анимации исчезновения показываем новый контент
      const timeout = setTimeout(() => {
        setContent(children);
        setCurrentPathname(pathname);
        setIsVisible(true);
      }, 300);

      return () => clearTimeout(timeout);
    } else if (!isVisible) {
      // При первоначальной загрузке показываем контент с небольшой задержкой
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [pathname, currentPathname, children, isVisible]);

  // При монтировании компонента показываем контент
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible
          ? 'opacity-100 transform translate-y-0'
          : 'opacity-0 transform translate-y-4'
      } ${className}`}
    >
      {content}
    </div>
  );
}
