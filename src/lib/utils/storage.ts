/**
 * Storage utility to handle localStorage operations safely
 * with proper error handling and type safety
 */

const isClient = typeof window !== 'undefined';

/**
 * Safe wrapper for localStorage get operations
 * @param key The key to retrieve from storage
 * @param defaultValue Optional default value if key doesn't exist
 * @returns The stored value or defaultValue if not found
 */
export function getItem<T>(key: string, defaultValue?: T): T|null|undefined {
  if (!isClient) return defaultValue ?? null;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue ?? null;

    // Try to parse as JSON, fallback to raw value if parsing fails
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return defaultValue ?? null;
  }
}

/**
 * Safe wrapper for localStorage set operations
 * @param key The key to store
 * @param value The value to store (will be JSON stringified if not a string)
 * @returns True if successful, false otherwise
 */
export function setItem(key: string, value: unknown): boolean {
  if (!isClient) return false;

  try {
    const valueToStore =
        typeof value === 'string' ? value : JSON.stringify(value);

    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
    return false;
  }
}

/**
 * Safe wrapper for localStorage remove operations
 * @param key The key to remove
 * @returns True if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  if (!isClient) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all localStorage items
 * @returns True if successful, false otherwise
 */
export function clearStorage(): boolean {
  if (!isClient) return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

// Typed storage for common app values
export const Storage = {
  // Auth related
  getAccessToken: () => getItem<string>("accessToken"),
  setAccessToken: (token: string) => setItem("accessToken", token),
  getRefreshToken: () => getItem<string>("refreshToken"),
  setRefreshToken: (token: string) => setItem("refreshToken", token),
  getGuestToken: () => getItem<string>("guestToken"),
  setGuestToken: (token: string) => setItem("guestToken", token),

  // Region related
  getRegion: () => getItem<{id: string; name: string}>('selectedRegion'),
  setRegion: (region: {id: string; name: string}) =>
      setItem('selectedRegion', region),
  getTokenRegionId: () => getItem<string>('tokenRegionId'),
  setTokenRegionId: (id: string) => setItem('tokenRegionId', id),

  // Clear auth data
  clearAuth: () => {
    removeItem('accessToken');
    removeItem('refreshToken');
    removeItem('guestToken');
    return true;
  },
};

export default Storage;
