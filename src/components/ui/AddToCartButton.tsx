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
  size?: 'sm' | 'md' | 'lg';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  price,
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { showSuccess, showError } = useNotificationContext();

  // Styles based on variant and size
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'outline':
        return 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-300';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-1.5 px-3';
      case 'md':
        return 'text-sm py-2 px-4';
      case 'lg':
        return 'text-base py-2.5 px-5';
      default:
        return 'text-sm py-2 px-4';
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simulate success
      setIsAdded(true);

      // Show success notification
      showSuccess(`"${productName}" добавлен в корзину`, {
        title: 'Товар добавлен',
        timeout: 5000,
      });

      // Reset button state after a delay
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      // Show error notification
      showError('Не удалось добавить товар в корзину', {
        title: 'Ошибка',
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${getVariantClasses()} ${getSizeClasses()} ${className} ${
        isLoading ? 'opacity-70 cursor-wait' : ''
      } ${isAdded ? 'scale-95' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Добавление...
        </span>
      ) : (
        <span className="flex items-center">
          {isAdded ? (
            <ShoppingCartIconSolid className="h-4 w-4 mr-1.5" />
          ) : (
            <ShoppingCartIcon className="h-4 w-4 mr-1.5" />
          )}
          {isAdded ? 'Добавлено' : 'В корзину'}
          {price && (
            <span className="ml-2 font-bold">
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                maximumFractionDigits: 0,
              }).format(price)}
            </span>
          )}
        </span>
      )}
    </button>
  );
};

export default AddToCartButton;
