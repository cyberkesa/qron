import { useState, useRef, useEffect } from "react";
import { ProductSortOrder } from "@/types/api";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ProductSorterProps {
  value: ProductSortOrder;
  onChange: (value: ProductSortOrder) => void;
  className?: string;
}

// Опции сортировки с удобочитаемыми названиями
const sortOptions = [
  { value: "RELEVANCE", label: "По релевантности" },
  { value: "NEWEST_FIRST", label: "Сначала новые" },
  { value: "CHEAPEST_FIRST", label: "Сначала дешевые" },
  { value: "EXPENSIVE_FIRST", label: "Сначала дорогие" },
  { value: "ALPHABETICALLY", label: "По алфавиту" },
];

export const ProductSorter = ({
  value,
  onChange,
  className = "",
}: ProductSorterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        <span className="mr-3 text-gray-700 font-medium">Сортировка:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-between min-w-[200px] hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-gray-800">{selectedOption.label}</span>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Выпадающий список для опций сортировки */}
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 max-h-60 overflow-auto">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                handleOptionClick(option.value as ProductSortOrder)
              }
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 ${
                option.value === value
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-800"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              <span>{option.label}</span>
              {option.value === value && <CheckIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
