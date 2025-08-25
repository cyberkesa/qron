'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || null;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const next = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }, []);

  const cycle = () => {
    const order: Theme[] = ['light', 'dark', 'high-contrast'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const label =
    theme === 'light' ? 'Светлая' : theme === 'dark' ? 'Тёмная' : 'Контрастная';

  return (
    <button
      type="button"
      onClick={cycle}
      className="text-gray-700 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`Переключить тему. Текущая: ${label}`}
      title={`Тема: ${label}`}
    >
      {label}
    </button>
  );
}

export default ThemeToggle;
