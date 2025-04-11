"use client";

import { useState } from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import { Region } from "@/types/api";

// Тип для табов
type TabType = "description" | "specs" | "delivery";

interface ProductAttribute {
  name: string;
  value: string;
}

interface ProductTabsProps {
  description: string;
  attributes?: ProductAttribute[];
  currentRegion: Region | null;
  onRegionChange: () => void;
}

const ProductTabs = ({
  description,
  attributes = [],
  currentRegion,
  onRegionChange,
}: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("description");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="flex overflow-x-auto border-b border-gray-200">
        <button
          onClick={() => setActiveTab("description")}
          className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "description"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Описание
        </button>
        {attributes && attributes.length > 0 && (
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "specs"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Характеристики
          </button>
        )}
        <button
          onClick={() => setActiveTab("delivery")}
          className={`py-4 px-6 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "delivery"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Доставка и оплата
        </button>
      </div>

      {/* Содержимое вкладок */}
      <div className="p-6">
        {activeTab === "description" && (
          <div className="prose prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        )}

        {activeTab === "specs" && (
          <div>
            {attributes && attributes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map((attr: ProductAttribute, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between py-3 border-b border-gray-100 even:bg-gray-50 px-3 rounded-lg"
                  >
                    <span className="text-gray-600">{attr.name}</span>
                    <span className="font-medium text-gray-900">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p>Характеристики не указаны</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Доставка
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
                <div className="flex items-start">
                  <TruckIcon className="h-5 w-5 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="mb-2">
                      Мы осуществляем доставку по всей России. Сроки доставки
                      зависят от вашего региона и обычно составляют от 1 до 7
                      рабочих дней.
                    </p>
                    <p>
                      <span className="font-medium">Текущий регион:</span>{" "}
                      {currentRegion?.name || "Не выбран"}
                      <button
                        onClick={onRegionChange}
                        className="ml-2 underline hover:text-blue-600"
                      >
                        Изменить
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Оплата</h3>
              <p className="mb-3 text-gray-600">
                Доступны следующие способы оплаты:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Оплата наличными или картой при получении</span>
                </li>
                <li className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>
                    Оплата по безналичному расчету (для юридических лиц)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
