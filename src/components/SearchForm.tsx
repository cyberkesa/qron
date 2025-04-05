"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "@/lib/queries";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Category } from "@/types/api";

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("Все категории");

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.rootCategories || [];

  useEffect(() => {
    // Если URL содержит параметр поиска, установим его в строку поиска
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }

    // Если URL содержит параметр категории, установим выбранную категорию
    const urlCategory = searchParams.get("category");
    if (urlCategory && categories.length > 0) {
      setSelectedCategory(urlCategory);
      const category = categories.find(
        (cat: Category) => cat.id === urlCategory
      );
      if (category) {
        setCategoryTitle(category.title);
      }
    }
  }, [searchParams, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      router.push(`/search?${params.toString()}`);
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCategory = (id: string, title: string) => {
    setSelectedCategory(id);
    setCategoryTitle(title);
    setIsDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full flex">
      {/* Dropdown для выбора категории */}
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex items-center h-full px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-r-0 border-gray-300 rounded-l-md transition-colors"
        >
          <span className="hidden md:inline truncate max-w-[120px]">
            {categoryTitle}
          </span>
          <span className="md:hidden">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </span>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-50 max-h-80 overflow-y-auto border border-gray-200">
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => selectCategory("", "Все категории")}
            >
              Все категории
            </div>
            <div className="border-t border-gray-100"></div>
            {categories.map((category: Category) => (
              <div
                key={category.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => selectCategory(category.id, category.title)}
              >
                {category.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Поле поиска */}
      <input
        type="text"
        placeholder="Поиск товаров..."
        className="w-full py-2 px-4 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Кнопка поиска */}
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label="Поиск"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
