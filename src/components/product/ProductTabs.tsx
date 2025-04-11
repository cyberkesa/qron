"use client";

import { useState, useEffect, useRef } from "react";
import {
  TruckIcon,
  InformationCircleIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
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
  const [tabHeight, setTabHeight] = useState<number>(0);

  // Create refs for each tab content
  const descriptionTabRef = useRef<HTMLDivElement>(null);
  const specsTabRef = useRef<HTMLDivElement>(null);
  const deliveryTabRef = useRef<HTMLDivElement>(null);

  // Effect to animate tab content height for smooth transitions
  useEffect(() => {
    // Give time for the tab content to render
    const timer = setTimeout(() => {
      let activeTabRef;

      switch (activeTab) {
        case "description":
          activeTabRef = descriptionTabRef;
          break;
        case "specs":
          activeTabRef = specsTabRef;
          break;
        case "delivery":
          activeTabRef = deliveryTabRef;
          break;
        default:
          activeTabRef = descriptionTabRef;
      }

      if (activeTabRef?.current) {
        setTabHeight(activeTabRef.current.scrollHeight);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
      {/* Tabs - horizontal scrollable on mobile */}
      <div className="flex overflow-x-auto border-b border-gray-200 no-scrollbar">
        <button
          onClick={() => setActiveTab("description")}
          className={`py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "description"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-900"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="flex items-center gap-1.5">
            <InformationCircleIcon className="h-4 w-4" />
            <span>Описание</span>
          </div>
          {activeTab === "description" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-slideInLeft" />
          )}
        </button>

        {attributes && attributes.length > 0 && (
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
              activeTab === "specs"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="flex items-center gap-1.5">
              <ListBulletIcon className="h-4 w-4" />
              <span>Характеристики</span>
            </div>
            {activeTab === "specs" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-slideInLeft" />
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("delivery")}
          className={`py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "delivery"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-900"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="flex items-center gap-1.5">
            <TruckIcon className="h-4 w-4" />
            <span>Доставка и оплата</span>
          </div>
          {activeTab === "delivery" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-slideInLeft" />
          )}
        </button>
      </div>

      {/* Содержимое вкладок */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: tabHeight ? `${tabHeight}px` : "auto" }}
      >
        <div
          ref={descriptionTabRef}
          className={`p-3 md:p-6 ${activeTab === "description" ? "block animate-fadeIn" : "hidden"}`}
        >
          <div className="prose prose-sm md:prose-base prose-blue max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: description }}
              className="text-sm md:text-base"
            />
          </div>
        </div>

        <div
          ref={specsTabRef}
          className={`p-3 md:p-6 ${activeTab === "specs" ? "block animate-fadeIn" : "hidden"}`}
        >
          {attributes && attributes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {attributes.map((attr: ProductAttribute, index: number) => (
                <div
                  key={index}
                  className="flex justify-between py-2 md:py-3 border-b border-gray-100 even:bg-gray-50 px-2 md:px-3 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-gray-600">{attr.name}</span>
                  <span className="font-medium text-gray-900 ml-2 text-right">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 md:py-6 text-gray-500">
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:h-12 md:w-12 mx-auto text-gray-300"
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
              <p className="text-sm">Характеристики не указаны</p>
            </div>
          )}
        </div>

        <div
          ref={deliveryTabRef}
          className={`p-3 md:p-6 ${activeTab === "delivery" ? "block animate-fadeIn" : "hidden"}`}
        >
          <div className="space-y-4 md:space-y-6 text-sm md:text-base">
            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 md:mb-3">
                Доставка
              </h3>
              <div className="bg-blue-50 rounded-lg p-3 md:p-4 text-blue-800 text-xs md:text-sm hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-start">
                  <TruckIcon className="h-4 w-4 md:h-5 md:w-5 mt-0.5 mr-2 md:mr-3 shrink-0" />
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
                        className="ml-2 underline hover:text-blue-600 focus:outline-none focus:text-blue-700 active:text-blue-800 transition-colors"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        Изменить
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 md:mb-3">
                Оплата
              </h3>
              <p className="mb-2 md:mb-3 text-gray-600 text-xs md:text-sm">
                Доступны следующие способы оплаты:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center bg-gray-50 p-2 md:p-3 rounded-lg text-xs md:text-sm hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
                  <span>Оплата наличными или картой при получении</span>
                </li>
                <li className="flex items-center bg-gray-50 p-2 md:p-3 rounded-lg text-xs md:text-sm hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
                  <span>
                    Оплата по безналичному расчету (для юридических лиц)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
