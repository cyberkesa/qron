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
  return (
    <div className={cn('flex items-center gap-2 sm:gap-3', className)}>
      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? 'bg-gray-900' : 'bg-gray-200'
        } relative inline-flex items-center h-5 w-9 sm:h-6 sm:w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 touch-manipulation flex-shrink-0`}
      >
        <span
          className={`${
            value
              ? 'translate-x-5 sm:translate-x-6'
              : 'translate-x-0.5 sm:translate-x-1'
          } inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>

      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap leading-tight">
        Скрыть отсутствующие
      </span>
    </div>
  );
}
