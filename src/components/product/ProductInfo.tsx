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
  return (
    <div className="flex flex-col">
      {/* Заголовок и артикул */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {product.sku && (
            <div className="flex items-center">
              <span>Артикул: </span>
              <span className="ml-1 font-medium">{product.sku}</span>
            </div>
          )}

          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {product.category.title}
            </Link>
          )}

          {/* Регион */}
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{currentRegion?.name || "Не выбран"}</span>
            <button
              className="ml-1 text-blue-600 underline hover:text-blue-800"
              onClick={onRegionChange}
            >
              Изменить
            </button>
          </div>
        </div>
      </div>

      {/* Цена и статус наличия */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice && product.oldPrice > product.price && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Статус наличия */}
        <div className="mb-4 space-y-3">
          {!notAvailableInRegion ? (
            <div className="flex flex-wrap items-center gap-3">
              {/* Бейдж "В наличии" */}
              <div className="flex items-center px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full transition-all hover:bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-medium text-sm">В наличии</span>
              </div>

              {/* Остаток на складе */}
              {product.stock > 0 && (
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  <span>
                    Осталось: {product.stock} {product.unit || "шт"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Бейдж "Нет в наличии" */}
              <div className="flex items-center px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-sm">Нет в наличии</span>
              </div>

              {/* Блок с предложением проверить другие регионы */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-sm text-blue-800 transition-all hover:bg-blue-100/50">
                <div className="flex items-start">
                  <div>
                    <p>
                      Проверьте наличие в других регионах или{" "}
                      <button
                        onClick={onRegionChange}
                        className="font-medium underline hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
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

        {/* Количество и добавление в корзину */}
        <div className="flex items-center space-x-4">
          {currentCartQuantity > 0 ? (
            <div className="flex items-center border rounded-md overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => onUpdateQuantity(-1)}
                disabled={
                  currentCartQuantity <= (product.quantityMultiplicity || 1)
                }
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <div className="w-12 text-center font-medium">
                {currentCartQuantity}
              </div>
              <button
                onClick={() => onUpdateQuantity(1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
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
              }`}
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
          <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <span className="flex flex-col items-start gap-1.5">
              <span className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 mr-1.5 shrink-0 text-amber-500" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    Фасовка:{" "}
                    <b className="text-gray-900">
                      {product.quantityMultiplicity} шт. в упаковке
                    </b>
                  </span>
                  <span className="text-sm text-gray-600">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* <!-- 1 --> */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              Оригинальная продукция
            </h3>
            <p className="text-xs text-gray-500">Напрямую от производителей</p>
          </div>
        </div>

        {/* <!-- 2 --> */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
          <StarIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              Сертифицированное качество
            </h3>
            <p className="text-xs text-gray-500">С официальной гарантией</p>
          </div>
        </div>

        {/* <!-- 3 --> */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
          <CreditCardIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              Удобная оплата
            </h3>
            <p className="text-xs text-gray-500">
              Принимаем все формы расчетов
            </p>
          </div>
        </div>

        {/* <!-- 4 --> */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-start border border-gray-100">
          <CheckBadgeIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              Официальный дистрибьютор
            </h3>
            <p className="text-xs text-gray-500">Без посредников</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
