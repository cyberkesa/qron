"use client";

import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface StockFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function StockFilter({ value, onChange, className }: StockFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <span
          className={`${
            value ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className="text-sm text-gray-600">Скрыть отсутствующие</span>
    </div>
  );
}
