'use client';

import { useEffect } from 'react';

/**
 * Компонент для проверки контрастности цветов в development режиме
 * Автоматически сканирует DOM и выводит предупреждения о низкой контрастности
 */
const ContrastChecker: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const checkElementContrast = (element: Element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      // Пропускаем элементы без текста или с прозрачным фоном
      if (
        !color ||
        backgroundColor === 'rgba(0, 0, 0, 0)' ||
        !element.textContent?.trim()
      ) {
        return;
      }

      const contrast = calculateContrast(color, backgroundColor);

      if (contrast < 4.5) {
        console.warn(`🔍 Низкая контрастность (${contrast.toFixed(2)}:1):`, {
          element,
          color,
          backgroundColor,
          text: element.textContent?.slice(0, 50),
          classes: element.className,
        });
      }
    };

    const calculateContrast = (
      foreground: string,
      background: string
    ): number => {
      const getLuminance = (color: string): number => {
        // Парсим RGB значения из строки
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return 0;

        const [r, g, b] = rgb.map((val) => {
          const normalized = parseInt(val) / 255;
          return normalized <= 0.03928
            ? normalized / 12.92
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const l1 = getLuminance(foreground);
      const l2 = getLuminance(background);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);

      return (lighter + 0.05) / (darker + 0.05);
    };

    const scanForContrastIssues = () => {
      // Сканируем все текстовые элементы
      const textElements = document.querySelectorAll(
        'p, span, a, h1, h2, h3, h4, h5, h6, button, label, div'
      );

      textElements.forEach((element) => {
        if (element.textContent?.trim()) {
          checkElementContrast(element);
        }
      });
    };

    // Запускаем проверку после загрузки страницы
    const timer = setTimeout(scanForContrastIssues, 2000);

    // Проверяем при изменении DOM
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      setTimeout(scanForContrastIssues, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Компонент не рендерит ничего
  return null;
};

/**
 * Хук для проверки конкретных цветов
 */
export const useContrastValidator = () => {
  const validateContrast = (
    foreground: string,
    background: string
  ): {
    ratio: number;
    isAACompliant: boolean;
    isAAACompliant: boolean;
    level: 'fail' | 'AA' | 'AAA';
  } => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) {
      return {
        ratio: 0,
        isAACompliant: false,
        isAAACompliant: false,
        level: 'fail',
      };
    }

    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    return {
      ratio,
      isAACompliant: ratio >= 4.5,
      isAAACompliant: ratio >= 7,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
    };
  };

  return { validateContrast };
};

/**
 * Компонент для визуального тестирования контрастности
 */
export const ContrastTestCard: React.FC<{
  foreground: string;
  background: string;
  text?: string;
}> = ({ foreground, background, text = 'Пример текста' }) => {
  const { validateContrast } = useContrastValidator();
  const result = validateContrast(foreground, background);

  return (
    <div className="border rounded-lg p-4 m-2">
      <div
        className="p-4 rounded mb-2"
        style={{ color: foreground, backgroundColor: background }}
      >
        {text}
      </div>
      <div className="text-sm space-y-1">
        <p>
          Контрастность: <strong>{result.ratio.toFixed(2)}:1</strong>
        </p>
        <p>
          Уровень:{' '}
          <strong
            className={
              result.level === 'AAA'
                ? 'text-green-600'
                : result.level === 'AA'
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          >
            {result.level}
          </strong>
        </p>
        <p>WCAG AA: {result.isAACompliant ? '✅' : '❌'}</p>
        <p>WCAG AAA: {result.isAAACompliant ? '✅' : '❌'}</p>
      </div>
    </div>
  );
};

export default ContrastChecker;
