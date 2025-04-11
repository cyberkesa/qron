import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface QuantityCounterProps {
  quantity: number;
  minQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isLoading?: boolean;
  className?: string;
}

export function QuantityCounter({
  quantity,
  minQuantity,
  onIncrement,
  onDecrement,
  isLoading = false,
  className = "",
}: QuantityCounterProps) {
  const [animateValue, setAnimateValue] = useState(false);
  const [prevQuantity, setPrevQuantity] = useState(quantity);

  useEffect(() => {
    if (quantity !== prevQuantity) {
      setAnimateValue(true);
      const timer = setTimeout(() => {
        setAnimateValue(false);
      }, 300);
      setPrevQuantity(quantity);
      return () => clearTimeout(timer);
    }
  }, [quantity, prevQuantity]);

  const handleIncrement = () => {
    if (!isLoading) {
      onIncrement();
    }
  };

  const handleDecrement = () => {
    if (!isLoading && quantity > minQuantity) {
      onDecrement();
    }
  };

  return (
    <div
      className={`flex items-center border rounded-lg overflow-hidden bg-white shadow-sm ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={isLoading || quantity <= minQuantity}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100 disabled:hover:text-gray-600"
        aria-label="Уменьшить количество"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <div className="w-12 text-center font-medium relative">
        {isLoading ? (
          <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full mx-auto"></div>
        ) : (
          <span
            className={`inline-block ${animateValue ? "animate-fade-in scale-110" : ""}`}
          >
            {quantity}
          </span>
        )}
      </div>
      <button
        onClick={handleIncrement}
        disabled={isLoading}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100 disabled:hover:text-gray-600"
        aria-label="Увеличить количество"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
