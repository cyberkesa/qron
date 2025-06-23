import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product, ProductStockAvailabilityStatus } from '@/types/api';
import { useCartContext } from '@/lib/providers/CartProvider';
import { useNotificationContext } from '@/lib/providers/NotificationProvider';

interface OptimizedProductCardProps {
  product: Product;
  priority?: boolean;
}

// Оптимизированная версия компонента ProductCard без избыточных запросов
const OptimizedProductCard = memo(
  ({ product, priority = false }: OptimizedProductCardProps) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const { showSuccess, showError } = useNotificationContext();
    const { addToCart: addToUnifiedCart, cart: unifiedCart } = useCartContext();

    // Получаем текущее количество товара в корзине
    const currentCartQuantity =
      unifiedCart.items.find((item) => item.product?.id === product.id)
        ?.quantity || 0;

    // Адаптивное форматирование цены
    const formattedPrice = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(product.price);

    // Форматированная старая цена
    const formattedOldPrice = product.decimalPrice
      ? new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: 0,
        }).format(parseFloat(product.decimalPrice))
      : null;

    // Вычисляем процент скидки
    const discountPercentage = (() => {
      if (!product.decimalPrice) return null;
      const oldPrice = parseFloat(product.decimalPrice);
      if (oldPrice <= product.price) return null;
      return Math.round(100 - (product.price / oldPrice) * 100);
    })();

    // Ручная обертка над добавлением в корзину
    const handleAddToCart = useCallback(async () => {
      try {
        setIsAddingToCart(true);
        const quantity = product.quantityMultiplicity || 1;
        await addToUnifiedCart(product, currentCartQuantity + quantity);
        showSuccess(`${product.name} добавлен в корзину`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        showError('Не удалось добавить товар в корзину');
      } finally {
        setIsAddingToCart(false);
      }
    }, [
      product,
      addToUnifiedCart,
      showSuccess,
      showError,
      currentCartQuantity,
    ]);

    const isOutOfStock =
      product.stockAvailabilityStatus ===
      ProductStockAvailabilityStatus.OUT_OF_STOCK;

    // Главное изображение товара
    const mainImage = product.images?.[0] || null;

    return (
      <div
        className={`group rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md sm:hover:shadow-lg relative h-full flex flex-col product-card ${
          isOutOfStock ? 'bg-gray-50 opacity-80' : 'bg-white'
        }`}
      >
        {/* Ссылка на товар */}
        <Link
          href={`/product/${product.slug}`}
          className="flex flex-col flex-grow outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label={product.name}
        >
          {/* Область изображения (относительное позиционирование) */}
          <div className="relative pt-[100%] bg-gray-100 overflow-hidden">
            {/* Процент скидки (если есть) */}
            {discountPercentage && (
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full z-10">
                -{discountPercentage}%
              </div>
            )}

            {/* Статус наличия - показываем только "Нет в наличии" */}
            {isOutOfStock && (
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gray-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full z-10">
                Нет в наличии
              </div>
            )}

            {/* Изображение товара с placeholder */}
            <div className="absolute inset-0 p-2 sm:p-4">
              {mainImage ? (
                <>
                  {/* Placeholder, пока не загрузится изображение */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                  )}
                  <Image
                    src={mainImage.url}
                    alt={product.name}
                    className={`object-contain transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill
                    sizes="(max-width: 640px) 40vw, (max-width: 768px) 33vw, 25vw"
                    priority={priority}
                    onLoad={() => setImageLoaded(true)}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-sm text-gray-400">Нет фото</span>
                </div>
              )}
            </div>
          </div>

          {/* Контентная часть карточки */}
          <div
            className={`p-2 sm:p-3 flex flex-col flex-grow ${
              isOutOfStock ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            {/* Название товара - уменьшено для мобильных */}
            <h3 className="text-sm sm:text-base font-medium line-clamp-2 mb-1 sm:mb-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-blue-700 transition-colors leading-tight product-card-title">
              {product.name}
            </h3>

            {/* Категория товара - скрыта на маленьких экранах */}
            {product.category && (
              <div className="text-xs text-gray-500 mb-1 line-clamp-1 hidden sm:block">
                {product.category.title}
              </div>
            )}

            {/* Цена и кнопка "В корзину" */}
            <div className="mt-auto pt-1 sm:pt-2">
              <div className="flex justify-between items-end">
                {/* Блок с ценами */}
                <div className="flex flex-col">
                  {/* Старая цена (если есть) */}
                  {formattedOldPrice && (
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      {formattedOldPrice}
                    </span>
                  )}
                  {/* Текущая цена */}
                  <span className="text-base sm:text-lg font-semibold">
                    {formattedPrice}
                  </span>
                </div>

                {/* Кнопка добавления в корзину */}
                {!isOutOfStock && (
                  <button
                    className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-200"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    disabled={isAddingToCart}
                    aria-label="Добавить в корзину"
                  >
                    {isAddingToCart ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;
