"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  MapPinIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  StarIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  TagIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { ProductStockAvailabilityStatus } from "@/types/api";
import { Region } from "@/types/api";
import { QuantityCounter } from "@/components/ui/QuantityCounter";
import { trackEvent } from "@/lib/analytics";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: number;
    oldPrice?: number;
    sku?: string;
    category?: {
      slug: string;
      title: string;
    };
    stock: number;
    unit?: string;
    quantityMultiplicity?: number;
    stockAvailabilityStatus: ProductStockAvailabilityStatus;
  };
  currentRegion: Region | null;
  currentCartQuantity: number;
  isAddingToCart: boolean;
  notAvailableInRegion: boolean;
  onAddToCart: () => Promise<void>;
  onUpdateQuantity: (delta: number) => Promise<void>;
  onRegionChange: () => void;
  formatPrice: (price: number) => string;
}

const ProductInfo = ({
  product,
  currentRegion,
  currentCartQuantity,
  isAddingToCart,
  notAvailableInRegion,
  onAddToCart,
  onUpdateQuantity,
  onRegionChange,
  formatPrice,
}: ProductInfoProps) => {
  // Calculate sale percentage if there's an oldPrice
  const salePercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="flex flex-col animate-fadeIn">
      {/* Заголовок и артикул */}
      <div className="mb-3 md:mb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
          {product.sku && (
            <div className="flex items-center group">
              <CubeIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
              <span>Артикул: </span>
              <span className="ml-1 font-medium">{product.sku}</span>
            </div>
          )}

          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <TagIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 group-hover:text-blue-800 transition-colors" />
              <span className="underline-offset-2 group-hover:underline">
                {product.category.title}
              </span>
            </Link>
          )}

          {/* Регион */}
          <div className="flex items-center hover:text-gray-700 transition-colors">
            <MapPinIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="text-xs md:text-sm">
              {currentRegion?.name || "Не выбран"}
            </span>
            <button
              className="ml-1 text-blue-600 underline hover:text-blue-800 text-xs md:text-sm focus:outline-none focus:text-blue-700 transition-colors"
              onClick={onRegionChange}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Изменить
            </button>
          </div>
        </div>
      </div>

      {/* Цена и статус наличия */}
      <div className="bg-gray-50 rounded-xl p-3 md:p-5 mb-4 md:mb-6 border border-gray-100 hover:shadow-sm transition-shadow duration-300">
        <div className="flex flex-wrap items-end gap-2 md:gap-3 mb-3 md:mb-4">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>

          {salePercentage && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <span className="text-base md:text-lg text-gray-500 line-through">
                {formatPrice(product.oldPrice!)}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                -{salePercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Статус наличия */}
        <div className="mb-3 md:mb-4 space-y-2 md:space-y-3">
          {!notAvailableInRegion ? (
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Бейдж "В наличии" */}
              <div className="flex items-center px-2 md:px-3 py-1 md:py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full transition-all hover:bg-green-100">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-500 rounded-full mr-1.5 md:mr-2 animate-pulse"></div>
                <span className="font-medium text-xs md:text-sm">
                  В наличии
                </span>
              </div>

              {/* Остаток на складе */}
              {product.stock > 0 && (
                <div className="flex items-center text-xs md:text-sm text-gray-600 bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-gray-100">
                  <span>
                    Осталось: {product.stock} {product.unit || "шт"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {/* Бейдж "Нет в наличии" */}
              <div className="flex items-center px-2 md:px-3 py-1 md:py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-full">
                <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-red-500 rounded-full mr-1.5 md:mr-2"></div>
                <span className="font-medium text-xs md:text-sm">
                  Нет в наличии
                </span>
              </div>

              {/* Блок с предложением проверить другие регионы */}
              <div className="p-2 md:p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs md:text-sm text-blue-800 transition-all hover:bg-blue-100/50">
                <div className="flex items-start">
                  <div>
                    <p>
                      Проверьте наличие в других регионах или{" "}
                      <button
                        onClick={onRegionChange}
                        className="font-medium underline hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        выберите регион
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Количество и добавление в корзину - скрываем на мобильных (будет в MobileAddToCart) */}
        <div className="hidden md:flex items-center space-x-4">
          {currentCartQuantity > 0 ? (
            <div className="flex items-center border rounded-md overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => onUpdateQuantity(-1)}
                disabled={
                  currentCartQuantity <= (product.quantityMultiplicity || 1)
                }
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <div className="w-12 text-center font-medium">
                {currentCartQuantity}
              </div>
              <button
                onClick={() => onUpdateQuantity(1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition active:scale-95"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart || notAvailableInRegion}
              className={`flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors ${
                isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
              } active:scale-[0.99] transform`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Добавление...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Добавить в корзину
                </div>
              )}
            </button>
          )}
        </div>

        {/* Информация о шаге, если он больше 1 */}
        {product.quantityMultiplicity && product.quantityMultiplicity > 1 && (
          <div className="mt-3 px-2 md:px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs md:text-sm text-blue-800">
            <span className="flex flex-col items-start gap-1 md:gap-1.5">
              <span className="flex items-start">
                <ExclamationTriangleIcon className="h-3 w-3 md:h-4 md:w-4 mt-0.5 mr-1 md:mr-1.5 shrink-0 text-amber-500" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs md:text-sm">
                    Фасовка:{" "}
                    <b className="text-gray-900">
                      {product.quantityMultiplicity} шт. в упаковке
                    </b>
                  </span>
                  <span className="text-xs text-gray-600">
                    ◉ Цена указана за 1 шт.
                    <br />◉ В корзине считается количеством шт.
                  </span>
                </div>
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Блок с преимуществами */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
        {/* <!-- 1 --> */}
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-start border border-gray-100 transition-transform hover:translate-y-[-2px] hover:shadow-sm">
          <ShieldCheckIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 mr-2 md:mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-xs md:text-sm">
              Оригинальная продукция
            </h3>
            <p className="text-xs text-gray-500">Напрямую от производителей</p>
          </div>
        </div>

        {/* <!-- 2 --> */}
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-start border border-gray-100 transition-transform hover:translate-y-[-2px] hover:shadow-sm">
          <StarIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 mr-2 md:mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-xs md:text-sm">
              Гарантия качества
            </h3>
            <p className="text-xs text-gray-500">Проверенные товары</p>
          </div>
        </div>

        {/* <!-- 3 --> */}
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-start border border-gray-100 transition-transform hover:translate-y-[-2px] hover:shadow-sm">
          <CreditCardIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 mr-2 md:mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-xs md:text-sm">
              Удобная оплата
            </h3>
            <p className="text-xs text-gray-500">Онлайн и при получении</p>
          </div>
        </div>

        {/* <!-- 4 --> */}
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-start border border-gray-100 transition-transform hover:translate-y-[-2px] hover:shadow-sm">
          <CheckBadgeIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 mr-2 md:mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-xs md:text-sm">
              Быстрая доставка
            </h3>
            <p className="text-xs text-gray-500">По всей России</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
