'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { ADD_TO_CART } from '@/lib/queries';
import { GET_VIEWER, GET_CART } from '@/lib/queries';
import { Product, ProductStockAvailabilityStatus, Category } from '@/types/api';
import { CartItemUnified } from '@/lib/hooks/useCart';
import { useCartContext } from '@/lib/providers/CartProvider';
import useCachedImages from '@/lib/hooks/useCachedImages';
import { QuantityCounter } from '@/components/ui/QuantityCounter';
import { trackEvent } from '@/lib/analytics';
import { useNotificationContext } from '@/lib/providers/NotificationProvider';

// Вспомогательная функция для отображения пути категории
const formatCategoryPath = (category: Category) => {
  if (!category) return '';

  // Всегда показываем только текущую категорию (подкатегорию)
  return category.title;
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
}

// Оптимизированный компонент ProductCard с полной мобильной адаптацией
function ProductCardBase({ product, onAddToCart }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Получаем сервис уведомлений
  const { showSuccess, showError } = useNotificationContext();

  // Собираем все URL изображений для предзагрузки
  const imageUrls = useMemo(() => {
    if (!product.images || !product.images.length) return [];
    return product.images.map((img) => img.url);
  }, [product.images]);

  // Используем наш хук для кэширования изображений
  const { loadingStates } = useCachedImages(imageUrls, {
    placeholder: '/images/product-placeholder.png',
  });

  // Apollo Client для обновления кэша после добавления в корзину
  const { cart: unifiedCart, addToCart: addToUnifiedCart } = useCartContext();
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const { data: userData } = useQuery(GET_VIEWER);
  const apolloClient = useApolloClient();

  // Получаем текущее количество товара в корзине
  const currentCartQuantity = useMemo(() => {
    if (!unifiedCart || !unifiedCart.items) return 0;

    const cartItem = unifiedCart.items.find(
      (item: CartItemUnified) => item.product?.id === product.id
    );

    return cartItem ? cartItem.quantity : 0;
  }, [unifiedCart, product.id]);

  // Получаем уведомление о статусе товара (в наличии/нет в наличии)
  const getStockStatusBadge = useCallback(() => {
    switch (product.stockAvailabilityStatus) {
      case ProductStockAvailabilityStatus.OUT_OF_STOCK:
        return (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gray-500 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full z-10">
            Нет в наличии
          </div>
        );
      case ProductStockAvailabilityStatus.IN_STOCK_SOON:
        return (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-amber-500 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full z-10">
            Скоро в наличии
          </div>
        );
      default:
        return null;
    }
  }, [product.stockAvailabilityStatus]);

  // Ручная обертка над добавлением в корзину
  const handleUpdateQuantity = useCallback(
    async (delta: number) => {
      try {
        setIsAddingToCart(true);

        // Если функция onAddToCart передана извне, используем ее
        if (onAddToCart && delta > 0 && currentCartQuantity === 0) {
          await onAddToCart(product);
          showSuccess(`${product.name} добавлен в корзину`);
          return;
        }

        // Если не передан внешний обработчик или это изменение количества, используем универсальную логику
        const newQuantity = Math.max(
          0,
          currentCartQuantity + delta * (product.quantityMultiplicity || 1)
        );

        // Используем addToUnifiedCart из контекста корзины
        await addToUnifiedCart(product, newQuantity);

        // Если это первая позиция (добавление, а не изменение), показываем уведомление
        if (delta > 0 && currentCartQuantity === 0) {
          showSuccess(`${product.name} добавлен в корзину`);
        }

        // Аналитика добавления товара
        if (delta > 0 && currentCartQuantity === 0) {
          trackEvent('add_to_cart', {
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
          });
        }
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        showError(`Не удалось добавить товар в корзину`);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      product,
      currentCartQuantity,
      addToUnifiedCart,
      onAddToCart,
      showSuccess,
      showError,
    ]
  );

  // Форматирование цены - мемоизировано для предотвращения лишних рендеров
  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(product.price),
    [product.price]
  );

  // Форматированная старая цена - тоже мемоизирована
  const formattedOldPrice = useMemo(
    () =>
      product.decimalPrice
        ? new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          }).format(parseFloat(product.decimalPrice))
        : null,
    [product.decimalPrice]
  );

  // Вычисляем процент скидки
  const discountPercentage = useMemo(() => {
    if (!product.decimalPrice) return null;
    const oldPrice = parseFloat(product.decimalPrice);
    if (oldPrice <= product.price) return null;
    return Math.round(100 - (product.price / oldPrice) * 100);
  }, [product.price, product.decimalPrice]);

  const isOutOfStock =
    product.stockAvailabilityStatus ===
    ProductStockAvailabilityStatus.OUT_OF_STOCK;

  // Стили для карточки на основе доступности товара - адаптивные
  const cardClassName = useMemo(() => {
    const baseClasses =
      'group rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full flex flex-col product-card hover:border-gray-300';

    if (isOutOfStock) {
      return `${baseClasses} bg-gray-50 opacity-80`;
    }

    return `${baseClasses} bg-white`;
  }, [isOutOfStock]);

  const contentClassName = useMemo(() => {
    const baseClasses = 'p-2 sm:p-3 lg:p-4 flex flex-col flex-grow z-10';

    if (isOutOfStock) {
      return `${baseClasses} bg-gray-50`;
    }

    return `${baseClasses} bg-white`;
  }, [isOutOfStock]);

  const titleClassName = useMemo(() => {
    const baseClasses =
      'text-sm sm:text-base font-medium line-clamp-2 mb-1 sm:mb-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-blue-700 transition-colors leading-tight product-card-title';

    if (isOutOfStock) {
      return `${baseClasses} text-gray-600`;
    }

    return `${baseClasses} text-gray-800`;
  }, [isOutOfStock]);

  const priceClassName = useMemo(() => {
    const baseClasses = 'text-base sm:text-lg font-semibold product-card-price';

    if (isOutOfStock) {
      return `${baseClasses} text-gray-600`;
    }

    return `${baseClasses} text-gray-900`;
  }, [isOutOfStock]);

  return (
    <div
      className={cardClassName}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {getStockStatusBadge()}

      {discountPercentage && discountPercentage > 0 && (
        <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full z-10 animate-pulse shadow-sm">
          Скидка {discountPercentage}%
        </span>
      )}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="h-28 sm:h-40 lg:h-48 overflow-hidden relative flex items-center justify-center p-1 sm:p-3 lg:p-4 bg-white product-card-image group">
          {product.images && product.images.length > 0 ? (
            <>
              {product.images.length > 1 ? (
                // When we have multiple images, set up image switching on hover
                <>
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    className={`object-contain w-full h-full transition-opacity duration-300 ${
                      isOutOfStock ? 'filter grayscale opacity-70' : ''
                    } ${isHovering ? 'opacity-0' : 'opacity-100'} absolute inset-0`}
                    width={200}
                    height={200}
                    priority={false}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        '/images/product-placeholder.png';
                    }}
                  />
                  <Image
                    src={product.images[1].url}
                    alt={`${product.name} - изображение 2`}
                    className={`object-contain w-full h-full transition-opacity duration-300 ${
                      isOutOfStock ? 'filter grayscale opacity-70' : ''
                    } ${isHovering ? 'opacity-100' : 'opacity-0'} absolute inset-0`}
                    width={200}
                    height={200}
                    priority={false}
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        '/images/product-placeholder.png';
                    }}
                  />
                </>
              ) : (
                // Single image case
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  className={`object-contain w-full h-full transition-transform duration-300 group-hover:scale-110 ${
                    isOutOfStock ? 'filter grayscale opacity-70' : ''
                  }`}
                  width={200}
                  height={200}
                  priority={false}
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src =
                      '/images/product-placeholder.png';
                  }}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <span className="text-gray-400 text-xs sm:text-sm">
                Нет изображения
              </span>
            </div>
          )}

          {/* Quick view indicator with image count - скрыто на мобиле */}
          {product.images && product.images.length > 1 && (
            <div
              className={`hidden sm:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 to-transparent p-2 transition-opacity text-center ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                {product.images.slice(0, 4).map((_, index) => (
                  <span
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === (isHovering ? 1 : 0) ? 'bg-gray-600' : 'bg-gray-300'}`}
                  ></span>
                ))}
                {product.images.length > 4 && (
                  <span className="text-xs text-gray-700">
                    +{product.images.length - 4}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-700 font-medium mt-0.5 inline-block">
                {product.images.length} фото
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className={contentClassName}>
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors mb-1 inline-block hover-bright line-clamp-1 truncate product-card-category"
            onClick={(e) => e.stopPropagation()}
          >
            {formatCategoryPath(product.category)}
          </Link>
        )}

        <Link href={`/product/${product.slug}`} className="flex-grow">
          <h3 className={titleClassName}>{product.name}</h3>
        </Link>

        {product.quantityMultiplicity && product.quantityMultiplicity > 1 && (
          <div className="mt-1 text-xs text-gray-500">
            Продается по {product.quantityMultiplicity} шт
          </div>
        )}

        {product.sku && (
          <div className="mt-1 text-xs text-gray-500 truncate">
            Артикул: {product.sku}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex justify-between items-end mt-2 gap-1 sm:gap-2">
            <div className="min-w-0 flex-1">
              {formattedOldPrice && (
                <div className="text-xs text-gray-500 line-through truncate">
                  {formattedOldPrice}
                </div>
              )}
              <div className={`${priceClassName} truncate`}>
                {formattedPrice}
              </div>
            </div>

            {!isOutOfStock && currentCartQuantity > 0 ? (
              <div className="flex-shrink-0">
                <QuantityCounter
                  quantity={currentCartQuantity}
                  minQuantity={product.quantityMultiplicity || 1}
                  onIncrement={() => handleUpdateQuantity(1)}
                  onDecrement={() => handleUpdateQuantity(-1)}
                  isLoading={isAddingToCart}
                  small={true}
                />
              </div>
            ) : (
              <button
                onClick={() => handleUpdateQuantity(1)}
                disabled={isAddingToCart || isOutOfStock}
                className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-colors btn-pulse flex-shrink-0 ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                aria-label="Добавить в корзину"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Мемоизированный экспорт
export const ProductCard = memo(ProductCardBase);
