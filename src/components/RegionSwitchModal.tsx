"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_REGIONS, GET_CURRENT_REGION } from "@/lib/queries";
import { MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Region {
  id: string;
  name: string;
}

export default function RegionSwitchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // Загружаем список регионов
  const { data: regionsData, loading: regionsLoading } = useQuery(GET_REGIONS);

  // Загружаем текущий регион пользователя
  const { data: viewerData, loading: viewerLoading } =
    useQuery(GET_CURRENT_REGION);

  useEffect(() => {
    // Проверяем, есть ли сохраненный выбор региона
    const savedRegion = localStorage.getItem("selectedRegion");

    if (savedRegion) {
      const region = JSON.parse(savedRegion);
      setSelectedRegionId(region.id);
    }
    // Если нет сохраненного выбора, но есть данные от сервера
    else if (viewerData?.viewer?.region) {
      setSelectedRegionId(viewerData.viewer.region.id);

      // Сохраняем регион из API
      localStorage.setItem(
        "selectedRegion",
        JSON.stringify(viewerData.viewer.region)
      );
    }
    // Если нет ни сохраненного выбора, ни данных от сервера - открываем модальное окно
    else if (
      !viewerLoading &&
      !regionsLoading &&
      regionsData?.regions.length > 0
    ) {
      // Открываем модальное окно только если есть доступные регионы
      setIsOpen(true);
    }
  }, [viewerData, viewerLoading, regionsData, regionsLoading]);

  const handleRegionSelect = (region: Region) => {
    console.log("RegionSwitchModal: выбран регион:", region.name);
    setSelectedRegionId(region.id);

    // Сохраняем выбранный регион в localStorage
    localStorage.setItem("selectedRegion", JSON.stringify(region));

    // Очищаем токены для принудительной реаутентификации с новым регионом
    localStorage.removeItem("accessToken");
    localStorage.removeItem("guestToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenRegionId");
    console.log(
      "RegionSwitchModal: токены авторизации очищены для принудительного обновления"
    );

    setIsOpen(false);

    // Перезагружаем страницу для применения нового региона
    window.location.reload();
  };

  // Закрытие модального окна без выбора региона не должно быть возможно для новых пользователей
  const handleCloseModal = () => {
    const savedRegion = localStorage.getItem("selectedRegion");

    if (savedRegion || selectedRegionId) {
      // Если регион ранее был выбран, можно закрыть
      setIsOpen(false);
    } else if (regionsData?.regions && regionsData.regions.length > 0) {
      // Показываем предупреждение, что выбор региона обязателен
      alert("Пожалуйста, выберите регион для продолжения");
    }
  };

  // Если модальное окно не открыто, не отображаем компонент
  if (!isOpen || regionsLoading) {
    return null;
  }

  const regions = regionsData?.regions || [];

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
            Выберите ваш регион
          </h2>
          {selectedRegionId && (
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-4">
          Выберите ваш регион для отображения доступных товаров и актуальных цен
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {regions.map((region: Region) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region)}
              className={`px-4 py-3 rounded-md text-left ${
                selectedRegionId === region.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  : "border border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>

        {selectedRegionId && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
