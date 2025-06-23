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

export const StockFilter = ({
  value = false,
  onChange,
  className = '',
}: StockFilterProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 min-h-[38px] flex-shrink-0',
        className
      )}
    >
      {/* Используем компонент Switch из Headless UI вместо кастомного */}
      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? 'bg-green-500' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            value ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
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
  );
};
