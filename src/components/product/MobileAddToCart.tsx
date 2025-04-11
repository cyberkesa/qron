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
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 p-3 shadow-lg z-[1000]">
      <div className="flex items-center gap-3 max-w-screen-lg mx-auto">
        <div className="flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">
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
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm sm:text-base transition-all active:scale-[0.98] ${
              notAvailableInRegion
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isAddingToCart ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Добавление...
              </span>
            ) : notAvailableInRegion ? (
              "Нет в наличии"
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingCartIcon className="h-4 w-4 mr-2" />В корзину
              </span>
            )}
          </button>
        )}
      </div>
      {/* Add proper safe area bottom padding for modern iOS devices */}
      <div className="h-safe-bottom"></div>
    </div>
  );
};

export default MobileAddToCart;
