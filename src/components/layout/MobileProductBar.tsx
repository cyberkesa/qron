'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT } from '@/lib/queries';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { QuantityCounter } from '@/components/ui/QuantityCounter';
import { useState, useEffect } from 'react';

interface MobileProductBarProps {
  // Эти пропсы будут передаваться из контекста или состояния
}

export const MobileProductBar: React.FC = () => {
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

  const product = productData?.productBySlug;

  // Функция для форматирования цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Не показываем, если не на странице товара или нет данных товара
  if (!isVisible || !product) {
    return null;
  }

  return (
    <div
      className="fixed left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40"
      style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      {/* Основное содержимое */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 max-w-screen-lg mx-auto">
          {/* Цена */}
          <div className="flex-shrink-0 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-lg font-bold text-blue-700">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Кнопка добавления в корзину */}
          <button
            className="ml-auto px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className="flex items-center justify-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              <span>В корзину</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProductBar;
