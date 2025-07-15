'use client';

import { Switch } from '@headlessui/react';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';
import { useState } from 'react';

interface StockFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  showHint?: boolean;
}

/**
 * StockFilter — современный toggle для фильтра "Скрыть отсутствующие"
 * Использует Headless UI Switch, стилизован под общий стиль сайта
 * Props:
 *   value: boolean — текущее состояние
 *   onChange: (value: boolean) => void — обработчик изменения
 *   className: string — дополнительные классы
 *   showHint: boolean — показывать ли tooltip
 */
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
          // pixel-perfect: как ProductSorter
          'flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1 min-h-[36px] text-xs',
          'sm:px-4 sm:py-2 sm:rounded-lg sm:min-h-[38px] sm:text-sm',
          // убираем зеленую обводку, оставляем только hover
          'hover:border-gray-300',
          // убираем любые focus-обводки
          className
        )}
        onMouseEnter={() => showHint && setShowTooltip(true)}
        onMouseLeave={() => showHint && setShowTooltip(false)}
      >
        {/* Toggle Switch */}
        <Switch
          checked={value}
          onChange={onChange}
          className={cn(
            // pixel-perfect: как ProductSorter
            'relative inline-flex items-center rounded-full transition-colors duration-300 outline-none',
            'h-6 w-10 sm:h-6 sm:w-12',
            value ? 'bg-green-500' : 'bg-gray-200',
            // убираем любые focus-обводки
            'shadow-inner hover:shadow-md'
          )}
          aria-label={
            value ? 'Показать все товары' : 'Скрыть отсутствующие товары'
          }
        >
          <span className="sr-only">
            {value ? 'Показать все товары' : 'Скрыть отсутствующие товары'}
          </span>
          <span
            className={cn(
              // pixel-perfect: как ProductSorter
              'absolute top-1/2 -translate-y-1/2 transition-all duration-300',
              'h-4 w-4 sm:h-4 sm:w-4 rounded-full bg-white shadow-lg ring-1 ring-gray-300',
              value ? 'left-[calc(100%-1rem)]' : 'left-0'
            )}
          />
        </Switch>
        <span
          className={cn(
            // pixel-perfect: как ProductSorter
            'font-medium whitespace-nowrap leading-tight select-none transition-colors',
            'text-xs sm:text-sm',
            value ? 'text-green-700' : 'text-gray-700'
          )}
        >
          Скрыть отсутствующие
        </span>
      </div>
      {/* Tooltip (если нужен) */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-700 whitespace-nowrap animate-fade-in">
          Показывать только товары в наличии
        </div>
      )}
    </div>
  );
};
