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
        'flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 min-h-[38px]',
        className
      )}
    >
      {/* Toggle switch */}
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          id="stock-toggle"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
        />
        <label
          htmlFor="stock-toggle"
          className={`toggle-label block overflow-hidden h-5 rounded-full bg-gray-200 cursor-pointer ${
            value ? 'translate-x-5' : ''
          }`}
        ></label>
      </div>

      <span className="text-sm text-gray-700 whitespace-nowrap leading-tight">
        Скрыть отсутствующие
      </span>
    </div>
  );
};
