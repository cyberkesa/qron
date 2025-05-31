'use client';

import { useEffect } from 'react';

interface Http2OptimizerProps {
  imageDomains?: string[];
  preloadImages?: string[];
  priority?: boolean;
}

/**
 * Компонент для оптимизации HTTP/2 соединений
 * Предзагружает критические ресурсы и устанавливает соединения
 */
export const Http2Optimizer: React.FC<Http2OptimizerProps> = ({
  imageDomains = [
    'files.tovari-kron.ru',
    'tovari-kron.ru',
    'backend.qron.ru',
    'images.qron.ru',
    'api.tovari-kron.ru'
  ],
  preloadImages = [],
  priority = false,
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Устанавливаем HTTP/2 соединения для доменов изображений
    imageDomains.forEach((domain) => {
      // Создаем preconnect для каждого домена
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = `https://${domain}`;
      preconnectLink.crossOrigin = 'anonymous';
      
      // Проверяем, не существует ли уже такой link
      const existingLink = document.querySelector(
        `link[rel="preconnect"][href="https://${domain}"]`
      );
      
      if (!existingLink) {
        document.head.appendChild(preconnectLink);
      }

      // Создаем dns-prefetch как fallback
      const dnsPrefetchLink = document.createElement('link');
      dnsPrefetchLink.rel = 'dns-prefetch';
      dnsPrefetchLink.href = `https://${domain}`;
      
      const existingDnsLink = document.querySelector(
        `link[rel="dns-prefetch"][href="https://${domain}"]`
      );
      
      if (!existingDnsLink) {
        document.head.appendChild(dnsPrefetchLink);
      }
    });

    // Предзагружаем критические изображения
    preloadImages.slice(0, priority ? 6 : 3).forEach((src, index) => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      
      if (priority && index < 2) {
        preloadLink.setAttribute('fetchpriority', 'high');
      }
      
      // Добавляем поддержку современных форматов
      if (src.includes('tovari-kron.ru') || src.includes('files.tovari-kron.ru')) {
        // Пытаемся загрузить WebP версию
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
        
        // AVIF preload
        const avifLink = document.createElement('link');
        avifLink.rel = 'preload';
        avifLink.as = 'image';
        avifLink.href = avifSrc;
        avifLink.type = 'image/avif';
        
        // WebP preload
        const webpLink = document.createElement('link');
        webpLink.rel = 'preload';
        webpLink.as = 'image';
        webpLink.href = webpSrc;
        webpLink.type = 'image/webp';
        
        document.head.appendChild(avifLink);
        document.head.appendChild(webpLink);
      }
      
      document.head.appendChild(preloadLink);
    });

    // Cleanup function
    return () => {
      // Удаляем созданные links при размонтировании
      const createdLinks = document.querySelectorAll(
        'link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="preload"][as="image"]'
      );
      
      createdLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && (
          imageDomains.some(domain => href.includes(domain)) ||
          preloadImages.some(img => href.includes(img))
        )) {
          // Не удаляем, оставляем для кэширования
        }
      });
    };
  }, [imageDomains, preloadImages, priority]);

  return null;
};

/**
 * Хук для оптимизации HTTP/2 соединений
 */
export const useHttp2Optimization = (domains: string[] = []) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем поддержку HTTP/2
    const supportsHttp2 = 'serviceWorker' in navigator;
    
    if (!supportsHttp2) {
      console.warn('HTTP/2 optimization: Service Worker not supported');
      return;
    }

    // Устанавливаем соединения с доменами
    domains.forEach(async (domain) => {
      try {
        // Создаем тестовый запрос для установки соединения
        const response = await fetch(`https://${domain}`, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        
        console.log(`HTTP/2 connection established with ${domain}`);
      } catch (error) {
        console.warn(`Failed to establish connection with ${domain}:`, error);
      }
    });
  }, [domains]);
};

/**
 * Компонент для мониторинга HTTP/2 соединений
 */
export const Http2Monitor: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Мониторинг производительности сети
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Проверяем протокол
          if (resourceEntry.nextHopProtocol) {
            const isHttp2 = resourceEntry.nextHopProtocol.includes('h2');
            const domain = new URL(resourceEntry.name).hostname;
            
            if (domain.includes('tovari-kron.ru') || domain.includes('files.tovari-kron.ru')) {
              console.log(`${domain}: ${resourceEntry.nextHopProtocol} ${isHttp2 ? '✅' : '❌'}`);
            }
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);

  return null;
}; 