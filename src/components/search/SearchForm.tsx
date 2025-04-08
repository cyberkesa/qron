"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/lib/queries";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types/api";
import Link from "next/link";

// Компонент для элемента в выпадающем списке результатов
const SearchResultItem = ({ product }: { product: Product }) => (
  <Link
    href={`/product/${product.slug}`}
    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
  >
    <div className="flex items-center">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{product.name}</div>
        <div className="text-sm text-gray-500">{product.price} ₽</div>
      </div>
    </div>
  </Link>
);

// Основной компонент формы поиска
const SearchForm = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchRef = useRef<HTMLDivElement>(null);

  // Запрос товаров для живого поиска
  const { data: searchData, loading: searchLoading } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 5,
      searchQuery,
    },
    skip: !searchQuery || searchQuery.length < 2,
  });

  // Получаем результаты поиска
  const searchResults = useMemo(
    () =>
      searchData?.products?.edges?.map(
        (edge: { node: Product }) => edge.node,
      ) || [],
    [searchData],
  );

  // Обработчик изменения поля поиска
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Очищаем предыдущий таймаут
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Устанавливаем новый таймаут для задержки запроса
      searchTimeout.current = setTimeout(() => {
        if (value.length >= 2) {
          setIsResultsOpen(true);
        } else {
          setIsResultsOpen(false);
        }
      }, 300);
    },
    [],
  );

  // Обработчик отправки формы
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsResultsOpen(false);
      }
    },
    [searchQuery, router],
  );

  // Закрываем результаты при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsResultsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Поиск товаров..."
          className="w-full py-2 px-4 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setIsResultsOpen(true)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </form>

      {/* Выпадающий список результатов */}
      {isResultsOpen && (searchResults.length > 0 || searchLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {searchLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Поиск...
            </div>
          ) : (
            <>
              {searchResults.map((product: Product) => (
                <SearchResultItem key={product.id} product={product} />
              ))}
              {searchResults.length > 0 && (
                <div className="border-t border-gray-200 p-2 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Показать все результаты
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
