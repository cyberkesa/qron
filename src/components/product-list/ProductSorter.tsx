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
        className="bg-white border border-gray-300 rounded-md py-1.5 px-2 flex items-center justify-between w-full hover:border-blue-500 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs touch-manipulation"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-800 truncate text-xs">
          {selectedOption.shortLabel}
        </span>
        <ChevronDownIcon
          className={`h-3 w-3 text-gray-500 transition-transform duration-200 ml-1 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Выпадающий список для опций сортировки */}
      {isOpen && (
        <div className="absolute mt-1 w-full product-sorter-dropdown">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                handleOptionClick(option.value as ProductSortOrder)
              }
              className={`product-sorter-option touch-manipulation ${
                option.value === value ? 'selected' : ''
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="truncate text-xs">{option.shortLabel}</span>
              {option.value === value && (
                <CheckIcon className="h-3 w-3 flex-shrink-0 ml-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
