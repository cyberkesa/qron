/**
 * Простые утилиты для обхода кэширования при запросах данных
 */

/**
 * Добавляет параметр в URL для обхода кэша
 */
export function addCacheBuster(url: string): string {
  const urlObject = new URL(
    url,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  urlObject.searchParams.set("_t", Date.now().toString(36));
  return urlObject.toString();
}

/**
 * Выполняет fetch с заголовками, которые предотвращают кэширование
 */
export function fetchNoCache(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const headers = new Headers(options?.headers || {});
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");

  return fetch(addCacheBuster(url), { ...options, headers });
}

// Простой объект с утилитами
const cacheUtils = {
  addCacheBuster,
  fetchNoCache,
};

export default cacheUtils;
