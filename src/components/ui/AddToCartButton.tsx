import React, { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartIconSolid } from '@heroicons/react/24/solid';
import { useNotificationContext } from '@/lib/providers/NotificationProvider';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  price,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { showSuccess, showError } = useNotificationContext();

  // Styles based on variant and size - с мобильной адаптацией
  const getVariantClasses = () => {
    const baseClasses =
      'transition-all duration-200 active:scale-95 touch-manipulation';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseClasses} bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow-md`;
      case 'outline':
        return `${baseClasses} bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-300 hover:border-blue-400`;
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return {
          padding: 'text-xs py-1.5 px-2 sm:px-3',
          icon: 'h-3 w-3 sm:h-4 sm:w-4',
          spacing: 'mr-1 sm:mr-1.5',
        };
      case 'sm':
        return {
          padding: 'text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4',
          icon: 'h-4 w-4',
          spacing: 'mr-1 sm:mr-1.5',
        };
      case 'md':
        return {
          padding: 'text-sm sm:text-base py-2 sm:py-2.5 px-4 sm:px-5',
          icon: 'h-4 w-4 sm:h-5 sm:w-5',
          spacing: 'mr-1.5 sm:mr-2',
        };
      case 'lg':
        return {
          padding: 'text-base sm:text-lg py-2.5 sm:py-3 px-5 sm:px-6',
          icon: 'h-5 w-5 sm:h-6 sm:w-6',
          spacing: 'mr-2',
        };
      default:
        return {
          padding: 'text-sm sm:text-base py-2 sm:py-2.5 px-4 sm:px-5',
          icon: 'h-4 w-4 sm:h-5 sm:w-5',
          spacing: 'mr-1.5 sm:mr-2',
        };
    }
  };

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulate success
      setIsAdded(true);

      // Show success notification
      showSuccess(`"${productName}" добавлен в корзину`, 5000);

      // Reset button state after a delay
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      // Show error notification
      showError('Не удалось добавить товар в корзину', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = getSizeClasses();
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`
        rounded-lg font-medium flex items-center justify-center relative overflow-hidden
        ${getVariantClasses()} 
        ${sizeClasses.padding} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'} 
        ${isAdded ? 'scale-95' : ''}
        min-h-[2.5rem] sm:min-h-[3rem]
      `}
      aria-label={`Добавить ${productName} в корзину`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {/* Button content */}
      <span
        className={`flex items-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      >
        {isAdded ? (
          <ShoppingCartIconSolid
            className={`${sizeClasses.icon} ${sizeClasses.spacing} text-current`}
          />
        ) : (
          <ShoppingCartIcon
            className={`${sizeClasses.icon} ${sizeClasses.spacing} text-current`}
          />
        )}

        <span className="flex flex-col sm:flex-row sm:items-center">
          <span className="whitespace-nowrap">
            {isAdded ? 'Добавлено' : 'В корзину'}
          </span>

          {price && (
            <span className="font-bold text-xs sm:text-inherit sm:ml-2 mt-0.5 sm:mt-0">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
              }).format(price)}
            </span>
          )}
        </span>
      </span>

      {/* Success animation */}
      {isAdded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-ping">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default AddToCartButton;
