import { Product } from '@/types/api';
import { useViewHistory } from '@/lib/hooks/useViewHistory';
import { useMemo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ClockIcon } from '@heroicons/react/24/outline';

interface RecentlyViewedProps {
  excludeProductId?: string; // ID товара, который не нужно показывать (текущий товар)
  maxItems?: number; // Максимальное количество отображаемых товаров
}

export function RecentlyViewed({
  excludeProductId,
  maxItems = 4,
}: RecentlyViewedProps) {
  const { getRecentProducts } = useViewHistory();

  // Получаем историю просмотров и исключаем текущий товар
  const recentProducts = useMemo(() => {
    const products = getRecentProducts(maxItems + 1); // +1 на случай, если нужно исключить текущий товар
    return excludeProductId
      ? products
          .filter((product) => product.id !== excludeProductId)
          .slice(0, maxItems)
      : products.slice(0, maxItems);
  }, [getRecentProducts, excludeProductId, maxItems]);

  // Если нет просмотренных товаров, ничего не рендерим
  if (recentProducts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">
          Недавно просмотренные
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recentProducts.map((product, index) => (
          <ProductCard
            key={`recent-${product.id}-${index}`}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
