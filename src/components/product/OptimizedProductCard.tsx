import React, { memo, useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product, ProductStockAvailabilityStatus } from '@/types/api';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageContainer } from '@/components/ui/LayoutShiftPrevention';
import { usePerformantQuery } from '@/lib/hooks/usePerformantQuery';
import { ADD_TO_CART } from '@/lib/queries';
import { useMutation } from '@apollo/client';
import { useHttp2ImageLoader } from '@/components/ui/Http2ImageLoader';

interface OptimizedProductCardProps {
  product: Product;
  priority?: boolean;
  enableVirtualization?: boolean;
  onAddToCart?: (productId: string) => void;
}

/**
 * Оптимизированная карточка товара с улучшенной производительностью
 */
const OptimizedProductCard = memo<OptimizedProductCardProps>(
  ({
    product,
    priority = false,
    enableVirtualization = false,
    onAddToCart,
  }) => {
      const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMutation] = useMutation(ADD_TO_CART);

  // HTTP/2 оптимизация для изображений
  const productImages = useMemo(() => {
    return product.images?.map(img => img.url) || [];
  }, [product.images]);

  const { loadedImages } = useHttp2ImageLoader(productImages, {
    maxConcurrent: 2,
    priority,
    preload: priority,
  });

    // Мемоизированные вычисления
    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: 0,
        }).format(product.price),
      [product.price]
    );

    const formattedOldPrice = useMemo(() => {
      if (!product.decimalPrice) return null;
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(parseFloat(product.decimalPrice));
    }, [product.decimalPrice]);

    const discountPercentage = useMemo(() => {
      if (!product.decimalPrice) return null;
      const oldPrice = parseFloat(product.decimalPrice);
      if (oldPrice <= product.price) return null;
      return Math.round(100 - (product.price / oldPrice) * 100);
    }, [product.price, product.decimalPrice]);

    const isOutOfStock =
      product.stockAvailabilityStatus ===
      ProductStockAvailabilityStatus.OUT_OF_STOCK;

    const categoryPath = useMemo(() => {
      if (!product.category) return '';
      return product.category.title;
    }, [product.category]);

    // Обработчик добавления в корзину
    const handleAddToCart = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock || isAddingToCart) return;

        try {
          setIsAddingToCart(true);

          if (onAddToCart) {
            onAddToCart(product.id);
          } else {
            await addToCartMutation({
              variables: {
                productId: product.id,
                quantity: 1,
              },
            });
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
        } finally {
          setIsAddingToCart(false);
        }
      },
      [isOutOfStock, isAddingToCart, onAddToCart, product.id, addToCartMutation]
    );

    // Мемоизированные стили
    const cardStyles = useMemo(
      () => ({
        container: `
      group rounded-lg border border-gray-200 overflow-hidden 
      transition-all duration-200 hover:shadow-lg relative h-full 
      flex flex-col bg-white hover:border-gray-300
      ${isOutOfStock ? 'opacity-75' : ''}
    `.trim(),

        imageContainer: `
      relative aspect-square overflow-hidden bg-gray-50
      ${enableVirtualization ? 'will-change-transform' : ''}
    `.trim(),

        content: 'p-3 flex flex-col flex-grow',

        title: `
      text-sm font-medium line-clamp-2 mb-2 min-h-[2.5rem] 
      group-hover:text-blue-700 transition-colors leading-tight
      ${isOutOfStock ? 'text-gray-600' : 'text-gray-800'}
    `.trim(),

        price: `
      text-lg font-semibold mb-1
      ${isOutOfStock ? 'text-gray-600' : 'text-gray-900'}
    `.trim(),

        button: `
      w-full py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
      flex items-center justify-center gap-2 mt-auto
      ${
        isOutOfStock
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
      }
      ${isAddingToCart ? 'opacity-75 cursor-wait' : ''}
    `.trim(),
      }),
      [isOutOfStock, isAddingToCart, enableVirtualization]
    );

    // Основное изображение товара
    const mainImage = product.images?.[0];

    return (
      <Link href={`/product/${product.slug}`} className={cardStyles.container}>
        {/* Изображение товара */}
        <ImageContainer aspectRatio="1/1" className={cardStyles.imageContainer}>
          {mainImage ? (
            <OptimizedImage
              src={mainImage.url}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              enableLazyLoading={!priority && !loadedImages.includes(mainImage.url)}
              quality={75}
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Нет изображения</span>
            </div>
          )}

          {/* Бейдж скидки */}
          {discountPercentage && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Статус товара */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Нет в наличии</span>
            </div>
          )}
        </ImageContainer>

        {/* Контент карточки */}
        <div className={cardStyles.content}>
          {/* Категория */}
          {categoryPath && (
            <div className="text-xs text-gray-500 mb-1 truncate">
              {categoryPath}
            </div>
          )}

          {/* Название товара */}
          <h3 className={cardStyles.title}>{product.name}</h3>

          {/* Цены */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cardStyles.price}>{formattedPrice}</span>
            {formattedOldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formattedOldPrice}
              </span>
            )}
          </div>

          {/* Кнопка добавления в корзину */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={cardStyles.button}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Добавление...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-4 h-4" />
                {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
              </>
            )}
          </button>
        </div>
      </Link>
    );
  }
);

OptimizedProductCard.displayName = 'OptimizedProductCard';

export { OptimizedProductCard };

/**
 * Версия карточки для виртуализированных списков
 */
export const VirtualizedProductCard = memo<
  OptimizedProductCardProps & { style?: React.CSSProperties }
>(({ style, ...props }) => (
  <div style={style}>
    <OptimizedProductCard {...props} enableVirtualization />
  </div>
));

VirtualizedProductCard.displayName = 'VirtualizedProductCard';
