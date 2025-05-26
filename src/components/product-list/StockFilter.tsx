'use client';

import { Switch } from '@headlessui/react';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StockFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function StockFilter({ value, onChange, className }: StockFilterProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Проверка размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      {/* Мобильная иконка */}
      <EyeSlashIcon className="h-4 w-4 text-gray-500 sm:hidden flex-shrink-0" />

      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation ${
          isMobile
            ? 'h-4 w-8 rounded-md' // Мобильная версия - более прямоугольная
            : 'h-6 w-11 rounded-full' // Десктопная версия - округлая
        }`}
      >
        <span
          className={`${
            value
              ? isMobile
                ? 'translate-x-4'
                : 'translate-x-6'
              : 'translate-x-1'
          } inline-block transform transition-transform ${
            isMobile
              ? 'h-2 w-2 rounded-sm bg-white' // Мобильная версия - квадратная
              : 'h-4 w-4 rounded-full bg-white' // Десктопная версия - круглая
          }`}
        />
      </Switch>

      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
        {isMobile ? 'Скрыть' : 'Скрыть отсутствующие'}
      </span>
    </div>
  );
}
