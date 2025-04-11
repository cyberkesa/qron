"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { QuantityCounter } from "@/components/ui/QuantityCounter";

interface MobileAddToCartProps {
  price: number;
  formatPrice: (price: number) => string;
  currentCartQuantity: number;
  isAddingToCart: boolean;
  notAvailableInRegion: boolean;
  quantityMultiplicity: number;
  onAddToCart: () => Promise<void>;
  onUpdateQuantity: (delta: number) => Promise<void>;
}

const MobileAddToCart = ({
  price,
  formatPrice,
  currentCartQuantity,
  isAddingToCart,
  notAvailableInRegion,
  quantityMultiplicity,
  onAddToCart,
  onUpdateQuantity,
}: MobileAddToCartProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-3 shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
        </div>
        {currentCartQuantity > 0 ? (
          <QuantityCounter
            quantity={currentCartQuantity}
            minQuantity={quantityMultiplicity || 1}
            onIncrement={() => onUpdateQuantity(1)}
            onDecrement={() => onUpdateQuantity(-1)}
            isLoading={isAddingToCart}
            className="flex-1"
          />
        ) : (
          <button
            onClick={onAddToCart}
            disabled={isAddingToCart || notAvailableInRegion}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-base transition-all ${
              notAvailableInRegion
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-sm"
            }`}
          >
            {isAddingToCart ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Добавление...
              </span>
            ) : notAvailableInRegion ? (
              "Нет в наличии"
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />В корзину
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileAddToCart;
