export function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function setLocalStorageItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalStorageItem(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}
