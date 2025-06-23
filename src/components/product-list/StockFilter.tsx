'use client';

import { Switch } from '@headlessui/react';
import { EyeSlashIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface StockFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  showHint?: boolean;
}

export const StockFilter = ({
  value = false,
  onChange,
  className = '',
  showHint = false,
}: StockFilterProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 min-h-[38px] flex-shrink-0 transition-all duration-200',
          value ? 'border-green-300 bg-green-50/50' : 'hover:border-gray-300',
          className
        )}
        onMouseEnter={() => showHint && setShowTooltip(true)}
        onMouseLeave={() => showHint && setShowTooltip(false)}
      >
        <ArchiveBoxXMarkIcon
          className={`h-4 w-4 sm:h-5 sm:w-5 ${value ? 'text-green-600' : 'text-gray-400'}`}
        />

        {/* Используем компонент Switch из Headless UI */}
        <Switch
          checked={value}
          onChange={onChange}
          className={`${
            value ? 'bg-green-500' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
          aria-label={
            value ? 'Показать все товары' : 'Скрыть отсутствующие товары'
          }
        >
          <span className="sr-only">
            {value ? 'Показать все товары' : 'Скрыть отсутствующие товары'}
          </span>
          <span
            className={`${
              value ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
          />
        </Switch>

        <span
          className={`text-xs sm:text-sm whitespace-nowrap leading-tight ${
            value ? 'text-green-700 font-medium' : 'text-gray-700'
          }`}
        >
          Скрыть отсутствующие
        </span>
      </div>

      {/* Всплывающая подсказка */}
      {showTooltip && (
        <div className="absolute z-10 top-full left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
          {value
            ? 'В списке отображаются только товары, которые есть в наличии'
            : 'Включите, чтобы скрыть товары, которых нет в наличии'}
        </div>
      )}
    </div>
  );
};
