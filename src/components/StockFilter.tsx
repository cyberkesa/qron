import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  ShoppingBagIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/outline";

interface StockFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

// Опции фильтрации
const filterOptions = [
  {
    value: true,
    label: "Только в наличии",
    icon: ShoppingBagIcon,
    color: "text-green-600",
  },
  {
    value: false,
    label: "Все товары",
    icon: ArchiveBoxXMarkIcon,
    color: "text-gray-500",
  },
];

export const StockFilter = ({
  value,
  onChange,
  className = "",
}: StockFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Находим текущий выбранный вариант для отображения
  const selectedOption =
    filterOptions.find((option) => option.value === value) || filterOptions[0];

  // Закрываем выпадающий список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Обработчик выбора опции фильтрации
  const handleOptionClick = (optionValue: boolean) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption.icon;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center">
        <span className="mr-3 text-gray-700 font-medium">Наличие:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white border ${
            value ? "border-green-300" : "border-gray-300"
          } rounded-lg py-2 px-4 flex items-center justify-between min-w-[180px] hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            <SelectedIcon className={`h-5 w-5 mr-2 ${selectedOption.color}`} />
            <span className="text-gray-800">{selectedOption.label}</span>
          </div>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Выпадающий список для опций фильтрации */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-auto">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={String(option.value)}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                  option.value === value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-800"
                }`}
                role="option"
                aria-selected={option.value === value}
              >
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-2 ${option.color}`} />
                  <span>{option.label}</span>
                </div>
                {option.value === value && <CheckIcon className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
