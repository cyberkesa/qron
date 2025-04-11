/**
 * Утилиты для работы с аналитикой (Yandex Metrika)
 */

// Идентификатор счетчика Яндекс.Метрики
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "";

/**
 * Отправка события в Яндекс.Метрику
 * @param eventName Название события
 * @param parameters Дополнительные параметры события
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>,
): void {
  try {
    if (typeof window === "undefined" || !YANDEX_METRIKA_ID) return;

    if (window.ym) {
      window.ym(Number(YANDEX_METRIKA_ID), "reachGoal", eventName, parameters);
    }
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

/**
 * Отправка события просмотра виртуальной страницы в Яндекс.Метрику
 * @param url URL виртуальной страницы
 * @param options Дополнительные параметры
 */
export function trackPageView(url: string, options?: any): void {
  try {
    if (typeof window === "undefined" || !YANDEX_METRIKA_ID) return;

    if (window.ym) {
      window.ym(Number(YANDEX_METRIKA_ID), "hit", url, options);
    }
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}

/**
 * Отправка информации о заказе в Яндекс.Метрику (электронная коммерция)
 * @param orderId ID заказа
 * @param items Товары в заказе
 * @param total Общая сумма заказа
 */
export function trackOrder(
  orderId: string,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>,
  total: number,
): void {
  try {
    if (typeof window === "undefined" || !YANDEX_METRIKA_ID) return;

    // Подготавливаем данные для слоя данных
    const ecommerceData = {
      ecommerce: {
        purchase: {
          actionField: {
            id: orderId,
            revenue: total,
          },
          products: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category || "",
          })),
        },
      },
    };

    // Отправляем данные
    if (window.ym) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(ecommerceData);

      // Отправляем событие завершения заказа
      window.ym(Number(YANDEX_METRIKA_ID), "reachGoal", "order_complete", {
        order_id: orderId,
        order_amount: total,
      });
    }
  } catch (error) {
    console.error("Error tracking order:", error);
  }
}

// Объявляем типы для глобального объекта window
declare global {
  interface Window {
    ym: (id: number, action: string, eventName: string, params?: any) => void;
    dataLayer?: any[];
  }
}
