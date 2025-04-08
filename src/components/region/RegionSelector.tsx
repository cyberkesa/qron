"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useQuery } from "@apollo/client";
import { GET_REGIONS, GET_CURRENT_REGION } from "@/lib/queries";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Region } from "@/types/api";

// Определяем константы с контактами для каждого региона
export const REGION_CONTACTS = {
  MOSCOW: {
    name: "Москва",
    phone: "+7 (495) 799-26-66",
    phoneLink: "tel:+74957992666",
    email: "info@tovari-kron.ru",
    address: "Домодедовское шоссе, 4-й километр, 15Б",
  },
  STAVROPOL: {
    name: "Ставропольский край",
    phone: "+7 (903) 418-16-66",
    phoneLink: "tel:+79034181666",
    email: "ug@tovari-kron.ru",
    address: "с. Надежда, ул. Орджоникидзе 79",
  },
};

// Компонент для кнопки выбора региона
const RegionButton = memo(
  ({
    name,
    onClick,
    isSelected,
  }: {
    name: string;
    onClick: () => void;
    isSelected: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-md text-left ${
        isSelected
          ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
          : "border border-gray-200 hover:bg-gray-50 text-gray-700"
      }`}
    >
      {name}
    </button>
  ),
);

RegionButton.displayName = "RegionButton";

export default function RegionSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { data: regionsData } = useQuery(GET_REGIONS);
  const { data: viewerData } = useQuery(GET_CURRENT_REGION);

  // Мемоизируем регионы для предотвращения лишних рендеров
  const regions = useMemo(() => regionsData?.regions || [], [regionsData]);

  // При первой загрузке проверяем регион пользователя
  useEffect(() => {
    // Сначала проверяем, есть ли сохраненный регион в localStorage
    if (typeof window !== "undefined") {
      const savedRegion = localStorage.getItem("selectedRegion");

      try {
        if (savedRegion) {
          const parsedRegion = JSON.parse(savedRegion);
          setSelectedRegion(parsedRegion);
          return; // Если нашли регион в localStorage, используем его
        }
      } catch {
        localStorage.removeItem("selectedRegion");
      }
    }

    // Если нет в localStorage, то проверяем данные пользователя
    if (viewerData?.viewer?.region) {
      setSelectedRegion(viewerData.viewer.region);

      // Сохраняем в localStorage для будущего использования
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "selectedRegion",
          JSON.stringify(viewerData.viewer.region),
        );
      }
    }
    // Больше не выбираем автоматически первый регион, если не выбран
  }, [viewerData, regionsData]);

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);

    // Сохраняем выбранный регион в localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedRegion", JSON.stringify(region));

      // Очищаем токены для принудительной реаутентификации с новым регионом
      localStorage.removeItem("accessToken");
      localStorage.removeItem("guestToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenRegionId");
    }

    // Закрываем модальное окно
    setIsOpen(false);

    // Перезагружаем страницу для применения региона
    window.location.reload();
  };

  // Функция для открытия модального окна
  const openModal = () => setIsOpen(true);

  // Функция для закрытия модального окна
  const closeModal = () => {
    // Проверяем, выбран ли регион
    if (!selectedRegion && !viewerData?.viewer?.region) {
      alert("Пожалуйста, выберите регион для продолжения");
      return;
    }

    setIsOpen(false);
  };

  // Если данные еще не загружены или нет доступных регионов
  if (!regions.length) {
    return null;
  }

  return (
    <div className="flex items-center">
      <button
        onClick={openModal}
        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <MapPinIcon className="h-4 w-4 mr-1" />
        <span className="mr-1">
          {selectedRegion?.name || "Выберите регион"}
        </span>
      </button>

      {/* Модальное окно выбора региона */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                Выберите ваш регион
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Выберите ваш регион для отображения доступных товаров и актуальных
              цен
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {regions.map((region: Region) => (
                <RegionButton
                  key={region.id}
                  name={region.name}
                  onClick={() => handleRegionSelect(region)}
                  isSelected={selectedRegion?.id === region.id}
                />
              ))}
            </div>

            {selectedRegion && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
