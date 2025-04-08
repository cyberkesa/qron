import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPrice = (price: string): string => {
  return new Intl
      .NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2,
      })
      .format(parseFloat(price));
};

export const getOrderStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Ожидает обработки';
    case 'PROCESSING':
      return 'В обработке';
    case 'SHIPPED':
      return 'Отправлен';
    case 'DELIVERED':
      return 'Доставлен';
    case 'CANCELLED':
      return 'Отменен';
    default:
      return status;
  }
};

export const getOrderStatusClass = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
