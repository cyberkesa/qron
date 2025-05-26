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
      <div className="flex items-center">
        {/* Лейбл - скрыт на мобиле */}
        <span className="hidden sm:block mr-2 lg:mr-3 text-gray-700 font-medium text-sm lg:text-base whitespace-nowrap">
          Сортировка:
        </span>

        {/* Мобильная иконка */}
        <FunnelIcon className="h-4 w-4 text-gray-500 mr-2 sm:hidden flex-shrink-0" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-gray-300 rounded-lg py-2 px-3 sm:px-4 flex items-center justify-between w-full sm:min-w-[160px] lg:min-w-[200px] hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-manipulation"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-gray-800 truncate">
            {isMobile ? selectedOption.shortLabel : selectedOption.label}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ml-2 flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>
      </div>

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
              <span className="truncate">
                {isMobile ? option.shortLabel : option.label}
              </span>
              {option.value === value && (
                <CheckIcon className="h-4 w-4 flex-shrink-0 ml-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
