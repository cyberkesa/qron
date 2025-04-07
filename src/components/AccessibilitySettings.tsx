"use client";

import { useState, useEffect } from "react";
import {
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const CONTRAST_KEY = "kron_contrast_mode";
const KEYBOARD_NAV_KEY = "kron_keyboard_nav";

const getInitialValue = (key: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(key);
    return saved === "true";
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return false;
  }
};

const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing to localStorage: ${error}`);
  }
};

export function AccessibilitySettings(): JSX.Element {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() =>
    getInitialValue(CONTRAST_KEY)
  );
  const [isKeyboardNav, setIsKeyboardNav] = useState<boolean>(() =>
    getInitialValue(KEYBOARD_NAV_KEY)
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast");
    }
    if (isKeyboardNav) {
      document.documentElement.setAttribute("data-keyboard-nav", "true");
    }
  }, []);

  const toggleContrast = (): void => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    setLocalStorage(CONTRAST_KEY, String(newValue));
    document.documentElement.classList.toggle("high-contrast", newValue);
  };

  const toggleKeyboardNav = (): void => {
    const newValue = !isKeyboardNav;
    setIsKeyboardNav(newValue);
    setLocalStorage(KEYBOARD_NAV_KEY, String(newValue));
    document.documentElement.setAttribute(
      "data-keyboard-nav",
      String(newValue)
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Настройки доступности"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Настройки доступности</h3>

          <div className="space-y-4">
            <button
              type="button"
              onClick={toggleContrast}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>Высокая контрастность</span>
              {isHighContrast ? (
                <MoonIcon className="w-5 h-5 text-gray-700" />
              ) : (
                <SunIcon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleKeyboardNav}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>Навигация с клавиатуры</span>
              <ComputerDesktopIcon
                className={`w-5 h-5 ${
                  isKeyboardNav ? "text-blue-600" : "text-gray-700"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
