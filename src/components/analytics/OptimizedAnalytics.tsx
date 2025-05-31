import { useEffect, useState } from 'react';

interface OptimizedAnalyticsProps {
  yandexMetrikaId?: string;
  delay?: number;
}

/**
 * Оптимизированный компонент для аналитики с отложенной загрузкой
 */
export const OptimizedAnalytics: React.FC<OptimizedAnalyticsProps> = ({
  yandexMetrikaId = '100500',
  delay = 3000, // 3 секунды задержки
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Загружаем аналитику только после взаимодействия пользователя или через delay
    const loadAnalytics = () => setShouldLoad(true);

    // Слушатели событий пользователя
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    const handleUserInteraction = () => {
      loadAnalytics();
      // Удаляем слушатели после первого взаимодействия
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    // Добавляем слушатели
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
    });

    // Fallback - загружаем через delay, если нет взаимодействия
    const timer = setTimeout(loadAnalytics, delay);

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [delay]);

  useEffect(() => {
    if (!shouldLoad || typeof window === 'undefined') return;

    // Загружаем Яндекс.Метрику
    if (yandexMetrikaId) {
      loadYandexMetrika(yandexMetrikaId);
    }
  }, [shouldLoad, yandexMetrikaId]);

  return null;
};

/**
 * Функция для загрузки Яндекс.Метрики
 */
function loadYandexMetrika(id: string) {
  // Проверяем, не загружена ли уже метрика
  if ((window as any).ym) return;

  // Создаем скрипт
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';

  // Инициализируем метрику после загрузки скрипта
  script.onload = () => {
    (window as any).ym =
      (window as any).ym ||
      function (...args: any[]) {
        ((window as any).ym.a = (window as any).ym.a || []).push(args);
      };
    (window as any).ym.l = Date.now();

    // Инициализируем счетчик
    (window as any).ym(parseInt(id), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false, // Отключаем webvisor для производительности
      trackHash: true,
      ecommerce: 'dataLayer',
    });
  };

  // Добавляем скрипт в head
  document.head.appendChild(script);

  // Добавляем noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div>`;
  document.body.appendChild(noscript);
}

/**
 * Хук для отслеживания событий аналитики
 */
export const useAnalytics = () => {
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    // Яндекс.Метрика
    if ((window as any).ym) {
      (window as any).ym('reachGoal', eventName, params);
    }

    // Google Analytics (если нужно)
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window === 'undefined') return;

    // Яндекс.Метрика
    if ((window as any).ym) {
      (window as any).ym('hit', url);
    }

    // Google Analytics (если нужно)
    if ((window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    }
  };

  return { trackEvent, trackPageView };
};

// Используем any для window объектов аналитики
