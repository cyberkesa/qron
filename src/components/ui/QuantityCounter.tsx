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
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
  size = 'md',
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

  const getSizeClasses = () => {
    if (small) return getSizeClassesBySize('sm');
    if (compact) return getSizeClassesBySize('xs');

    return getSizeClassesBySize(size);
  };

  const getSizeClassesBySize = (sizeParam: 'xs' | 'sm' | 'md' | 'lg') => {
    const sizeMap = {
      xs: {
        button: 'w-6 h-6 sm:w-7 sm:h-7',
        counter: 'w-6 sm:w-8 px-1',
        icon: 'h-3 w-3',
        text: 'text-xs sm:text-sm',
      },
      sm: {
        button: 'w-7 h-7 sm:w-8 sm:h-8',
        counter: 'w-8 sm:w-10 px-1',
        icon: 'h-3 w-3 sm:h-4 sm:w-4',
        text: 'text-sm',
      },
      md: {
        button: 'w-8 h-8 sm:w-10 sm:h-10',
        counter: 'w-10 sm:w-12 px-2',
        icon: 'h-4 w-4',
        text: 'text-sm sm:text-base',
      },
      lg: {
        button: 'w-10 h-10 sm:w-12 sm:h-12',
        counter: 'w-12 sm:w-16 px-2',
        icon: 'h-4 w-4 sm:h-5 sm:w-5',
        text: 'text-base sm:text-lg',
      },
    };

    return sizeMap[sizeParam];
  };

  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`inline-flex items-center border border-gray-300 rounded-lg overflow-hidden ${
        disabled ? 'bg-gray-100 opacity-75' : 'bg-white'
      } shadow-sm transition-colors duration-150 ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={isLoading || disabled || quantity <= minQuantity}
        className={`${sizeClasses.button} flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 touch-manipulation`}
        aria-label="Уменьшить количество"
      >
        <MinusIcon className={sizeClasses.icon} />
      </button>

      <div
        className={`${sizeClasses.counter} text-center font-medium relative flex items-center justify-center min-h-[2rem] sm:min-h-[2.5rem]`}
      >
        {isLoading ? (
          <div className="animate-pulse h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded-full"></div>
        ) : (
          <span
            className={`inline-block transition-opacity duration-200 ${
              animateValue ? 'opacity-70' : ''
            } ${sizeClasses.text} font-semibold`}
          >
            {quantity}
          </span>
        )}
      </div>

      <button
        onClick={handleIncrement}
        disabled={isLoading || disabled}
        className={`${sizeClasses.button} flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 touch-manipulation`}
        aria-label="Увеличить количество"
      >
        <PlusIcon className={sizeClasses.icon} />
      </button>
    </div>
  );
}
