import { useState, useRef, useEffect } from 'react';
import { ProductSortOrder } from '@/types/api';
import {
  ChevronDownIcon,
  CheckIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface ProductSorterProps {
  value: ProductSortOrder;
  onChange: (value: ProductSortOrder) => void;
  className?: string;
}

// Опции сортировки с удобочитаемыми названиями
const sortOptions = [
  { value: 'NEWEST_FIRST', label: 'Сначала новинки', shortLabel: 'Новинки' },
  { value: 'CHEAPEST_FIRST', label: 'Сначала дешевле', shortLabel: 'Дешевле' },
  { value: 'EXPENSIVE_FIRST', label: 'Сначала дороже', shortLabel: 'Дороже' },
  { value: 'ALPHABETICALLY', label: 'По алфавиту', shortLabel: 'А-Я' },
];

export const ProductSorter = ({
  value,
  onChange,
  className = '',
}: ProductSorterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Проверка размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Находим текущий выбранный вариант для отображения
  const selectedOption =
    sortOptions.find((option) => option.value === value) || sortOptions[0];

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обработчик выбора опции сортировки
  const handleOptionClick = (option: ProductSortOrder) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-200 rounded-lg py-2 px-4 flex items-center justify-between w-full hover:border-gray-300 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm min-h-[38px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-800 truncate flex items-center">
          {selectedOption.shortLabel}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ml-1.5 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Выпадающий список для опций сортировки */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full shadow-lg product-sorter-dropdown bg-white border border-gray-200 rounded-lg py-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                handleOptionClick(option.value as ProductSortOrder)
              }
              className={`product-sorter-option touch-manipulation w-full text-left px-4 py-2 hover:bg-gray-50 ${
                option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              } flex items-center justify-between`}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="truncate text-sm">{option.shortLabel}</span>
              {option.value === value && (
                <CheckIcon className="h-4 w-4 flex-shrink-0 ml-1.5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
