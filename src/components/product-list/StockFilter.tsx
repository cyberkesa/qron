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
    <div className={cn('flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 min-h-[38px]', className)}>
      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? 'bg-gray-900' : 'bg-gray-200'
        } relative inline-flex items-center h-5 w-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation flex-shrink-0`}
      >
        <span
          className={`${
            value
              ? 'translate-x-5'
              : 'translate-x-1'
          } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
        />
      </Switch>

      <span className="text-sm text-gray-700 whitespace-nowrap leading-tight">
        Скрыть отсутствующие
      </span>
    </div>
  );
}
