'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { QuantityCounter } from '@/components/ui/QuantityCounter';

interface MobileAddToCartProps {
  price: number;
  formatPrice: (price: number) => string;
  isAddingToCart: boolean;
  notAvailableInRegion: boolean;
  onAddToCart: () => Promise<void>;
  onUpdateQuantity?: (delta: number) => Promise<void>;
  currentCartQuantity?: number;
}

const MobileAddToCart = ({
  price,
  formatPrice,
  isAddingToCart,
  notAvailableInRegion,
  onAddToCart,
  onUpdateQuantity,
  currentCartQuantity = 0,
}: MobileAddToCartProps) => {
  return (
    <div
      className="fixed left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] mobile-bottom-menu mobile-menu-animate z-40"
      style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      {/* Основное содержимое */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 max-w-screen-lg mx-auto">
          {/* Цена */}
          <div className="flex-shrink-0 mobile-price-badge px-3 py-2 rounded-lg">
            <span className="text-lg font-bold text-blue-700">
              {formatPrice(price)}
            </span>
          </div>

          {/* Кнопка или счетчик */}
          {currentCartQuantity > 0 && onUpdateQuantity ? (
            <div className="ml-auto">
              <QuantityCounter
                quantity={currentCartQuantity}
                minQuantity={1}
                onIncrement={() => onUpdateQuantity(1)}
                onDecrement={() => onUpdateQuantity(-1)}
                isLoading={isAddingToCart}
                compact={true}
              />
            </div>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart || notAvailableInRegion}
              className={`ml-auto px-6 py-3 rounded-xl font-semibold text-sm ${
                notAvailableInRegion
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 shadow-sm'
              }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Добавление...</span>
                </span>
              ) : notAvailableInRegion ? (
                'Нет в наличии'
              ) : (
                <span className="flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  <span>В корзину</span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileAddToCart;
