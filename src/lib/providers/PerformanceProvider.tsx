"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Упрощенный интерфейс контекста производительности
interface PerformanceContextType {
  // Приложение готово к использованию
  isReady: boolean;
}

// Создаем контекст с дефолтным значением
const PerformanceContext = createContext<PerformanceContextType>({
  isReady: true,
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceProviderProps {
  children: ReactNode;
}

/**
 * Упрощенный провайдер производительности
 * Оставлен как заглушка для совместимости с существующим кодом
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
}) => {
  // Всегда готово к использованию
  const [isReady] = useState<boolean>(true);

  const value: PerformanceContextType = {
    isReady,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
