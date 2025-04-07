import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

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
  const handleIncrement = () => {
    onIncrement();
  };

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onDecrement();
    }
  };

  return (
    <div
      className={`flex items-center border rounded-md overflow-hidden bg-white shadow-sm ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={isLoading || quantity <= minQuantity}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
        aria-label="Уменьшить количество"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <div className="w-12 text-center font-medium">
        {isLoading ? (
          <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full mx-auto"></div>
        ) : (
          quantity
        )}
      </div>
      <button
        onClick={handleIncrement}
        disabled={isLoading}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:hover:bg-white"
        aria-label="Увеличить количество"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
