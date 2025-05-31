'use client';

import Link from 'next/link';
import { memo } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface CartIndicatorProps {
  itemCount: number;
  totalPrice: string;
}

// Компонент индикатора корзины
const CartIndicator = memo(({ itemCount, totalPrice }: CartIndicatorProps) => {
  return (
    <div className="flex">
      <Link
        href="/cart"
        className="relative flex items-center text-gray-700 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label={itemCount > 0 ? `Корзина (${itemCount} товаров) - ${totalPrice}` : 'Корзина'}
        title={itemCount > 0 ? `В корзине ${itemCount} товаров на сумму ${totalPrice}` : 'Перейти в корзину'}
      >
        <div className="flex items-center gap-1 mr-2">
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </div>
          )}
        </div>
        {itemCount > 0 && (
          <div className="hidden md:block">
            <div className="text-xs text-gray-600">Корзина</div>
            <div className="text-sm font-medium">{totalPrice}</div>
          </div>
        )}
      </Link>
    </div>
  );
});

CartIndicator.displayName = 'CartIndicator';

export default CartIndicator;
