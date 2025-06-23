'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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
  TruckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ProductStockAvailabilityStatus } from '@/types/api';
import { Region } from '@/types/api';
import { QuantityCounter } from '@/components/ui/QuantityCounter';
import { trackEvent } from '@/lib/analytics';

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
  onUpdateQuantity?: (delta: number) => Promise<void>;
  onRegionChange: () => void;
  formatPrice: (price: number) => string;
}

// Компонент для карточки преимущества
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 product-info-card">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

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
    <div className="space-y-6">
      {/* Заголовок и мета-информация */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm product-info-card">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {product.sku && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <CubeIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Артикул:</span>
              <span className="font-semibold text-gray-900">{product.sku}</span>
            </div>
          )}

          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors group"
            >
              <TagIcon className="w-4 h-4 transition-transform" />
              <span className="font-medium">{product.category.title}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Цена и покупка */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm product-info-card">
        {/* Цена */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl lg:text-4xl font-bold text-gray-900 product-price">
              {formatPrice(product.price)}
            </span>

            {salePercentage && (
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.oldPrice!)}
                </span>
                <span className="px-3 py-1 bg-gray-800 text-white text-sm font-bold rounded-full shadow-sm">
                  -{salePercentage}%
                </span>
              </div>
            )}
          </div>

          {/* Статус наличия */}
          <div className="ml-auto">
            {!notAvailableInRegion ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 text-green-800 rounded-xl availability-badge">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="font-semibold text-sm">В наличии</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-400 text-gray-700 rounded-xl">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="font-semibold text-sm">Нет в наличии</span>
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация о товаре */}
        {!notAvailableInRegion && product.stock > 0 && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-800">
              Осталось:{' '}
              <span className="font-semibold">
                {product.stock} {product.unit || 'шт'}
              </span>
            </span>
          </div>
        )}

        {/* Кнопка добавления в корзину для десктопа */}
        <div className="block">
          {currentCartQuantity > 0 && onUpdateQuantity ? (
            <div className="flex items-center justify-center">
              <QuantityCounter
                quantity={currentCartQuantity}
                minQuantity={product.quantityMultiplicity || 1}
                onIncrement={() => onUpdateQuantity(1)}
                onDecrement={() => onUpdateQuantity(-1)}
                isLoading={isAddingToCart}
                compact={false}
                className="w-full max-w-[320px]"
              />
            </div>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart || notAvailableInRegion}
              className={`w-full max-w-[320px] h-14 bg-gray-900 text-white rounded-xl font-semibold text-lg shadow-md hover:bg-gray-800 transition-colors duration-200 ${
                isAddingToCart || notAvailableInRegion
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Добавление в корзину...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <ShoppingCartIcon className="w-6 h-6" />
                  <span>
                    {notAvailableInRegion
                      ? 'Товар недоступен'
                      : 'Добавить в корзину'}
                  </span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Информация о фасовке */}
        {product.quantityMultiplicity && product.quantityMultiplicity > 1 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm mb-2">
                  Особенности фасовки
                </h4>
                <div className="space-y-1 text-sm text-amber-700">
                  <p>
                    • Минимальная фасовка: {product.quantityMultiplicity} шт.
                  </p>
                  <p>• Цена указана за 1 штуку</p>
                  <p>• Товар продается упаковками</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeatureCard
          icon={ShieldCheckIcon}
          title="Гарантия качества"
          description="Оригинальная продукция напрямую от производителей"
        />

        <FeatureCard
          icon={TruckIcon}
          title="Быстрая доставка"
          description="Доставка по всей России в кратчайшие сроки"
        />

        <FeatureCard
          icon={CreditCardIcon}
          title="Удобная оплата"
          description="Онлайн-оплата или наличными при получении"
        />

        <FeatureCard
          icon={StarIcon}
          title="Лучшие цены"
          description="Конкурентные цены и регулярные акции"
        />
      </div>
    </div>
  );
};

export default ProductInfo;
