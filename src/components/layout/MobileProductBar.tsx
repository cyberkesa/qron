'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT } from '@/lib/queries';
import { QuantityCounter } from '@/components/ui/QuantityCounter';
import { AddToCartButton } from '@/components/ui/AddToCartButton';
import { useState, useEffect } from 'react';

interface MobileProductBarProps {
  product?: {
    id: string;
    name: string;
    price: number;
    available?: boolean;
  };
  currentCartQuantity?: number;
  isAddingToCart?: boolean;
  notAvailableInRegion?: boolean;
  onAddToCart?: () => Promise<void>;
  onUpdateQuantity?: (delta: number) => Promise<void>;
  formatPrice?: (price: number) => string;
}

export const MobileProductBar: React.FC<MobileProductBarProps> = ({
  product: propProduct,
  currentCartQuantity = 0,
  isAddingToCart = false,
  notAvailableInRegion = false,
  onAddToCart,
  onUpdateQuantity,
  formatPrice: propFormatPrice,
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  // Проверяем, находимся ли мы на странице товара
  useEffect(() => {
    const isProductPage = pathname?.startsWith('/product/');
    if (isProductPage && pathname) {
      const slug = pathname.split('/product/')[1];
      setProductSlug(slug);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setProductSlug(null);
    }
  }, [pathname]);

  // Получаем данные товара, если мы на странице товара
  const { data: productData } = useQuery(GET_PRODUCT, {
    variables: { slug: productSlug },
    skip: !productSlug,
    fetchPolicy: 'cache-first',
  });

  const product = propProduct || productData?.productBySlug;

  // Функция для форматирования цены
  const formatPrice =
    propFormatPrice ||
    ((price: number) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(price);
    });

  // Не показываем, если не на странице товара или нет данных товара
  if (!isVisible || !product) {
    return null;
  }

  return (
    <div
      className="fixed left-0 right-0 md:hidden bg-white border-t border-gray-300 shadow-[0_-2px_12px_rgba(0,0,0,0.15)] z-40"
      style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      {/* Основное содержимое */}
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Информация о товаре */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Цена */}
            <div className="flex-shrink-0">
              <div className="text-xs text-gray-600 leading-none">Цена</div>
              <div className="text-lg font-semibold text-gray-900 leading-tight">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Название товара (сокращенное) */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </div>
              <div className="text-xs text-gray-600">
                {!notAvailableInRegion ? 'В наличии' : 'Нет в наличии'}
              </div>
            </div>
          </div>

          {/* Кнопка добавления в корзину или счетчик количества */}
          {currentCartQuantity > 0 && onUpdateQuantity ? (
            <QuantityCounter
              quantity={currentCartQuantity}
              minQuantity={1}
              onIncrement={() => onUpdateQuantity(1)}
              onDecrement={() => onUpdateQuantity(-1)}
              isLoading={isAddingToCart}
              size="sm"
              className="flex-shrink-0"
            />
          ) : (
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
              variant="primary"
              size="sm"
              disabled={notAvailableInRegion}
              className="flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileProductBar;
