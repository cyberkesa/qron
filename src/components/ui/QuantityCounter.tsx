import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface QuantityCounterProps {
  quantity: number;
  minQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  small?: boolean;
  compact?: boolean;
}

export function QuantityCounter({
  quantity,
  minQuantity,
  onIncrement,
  onDecrement,
  isLoading = false,
  disabled = false,
  className = '',
  small = false,
  compact = false,
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
    if (!isLoading && !disabled) {
      onIncrement();
    }
  };

  const handleDecrement = () => {
    if (!isLoading && !disabled && quantity > minQuantity) {
      onDecrement();
    }
  };

  const buttonSize = small ? 'w-7 h-7' : compact ? 'w-8 h-8' : 'w-10 h-10';
  const counterWidth = small ? 'w-7' : compact ? 'w-8' : 'w-12';
  const buttonIconSize = small || compact ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div
      className={`inline-flex items-center border rounded-lg overflow-hidden ${disabled ? 'bg-gray-100 opacity-75' : 'bg-white'} shadow-sm ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={isLoading || disabled || quantity <= minQuantity}
        className={`${buttonSize} flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100 disabled:hover:text-gray-600`}
        aria-label="Уменьшить количество"
      >
        <MinusIcon className={buttonIconSize} />
      </button>
      <div className={`${counterWidth} text-center font-medium relative`}>
        {isLoading ? (
          <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full mx-auto"></div>
        ) : (
          <span
            className={`inline-block ${animateValue ? 'animate-fade-in scale-110' : ''} ${small || compact ? 'text-sm' : ''}`}
          >
            {quantity}
          </span>
        )}
      </div>
      <button
        onClick={handleIncrement}
        disabled={isLoading || disabled}
        className={`${buttonSize} flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-white disabled:active:scale-100 disabled:hover:text-gray-600`}
        aria-label="Увеличить количество"
      >
        <PlusIcon className={buttonIconSize} />
      </button>
    </div>
  );
}
