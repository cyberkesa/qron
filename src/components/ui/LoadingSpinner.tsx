import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  showText?: boolean;
  text?: string;
  className?: string;
  fullWidth?: boolean;
  color?: 'blue' | 'white' | 'gray';
  centered?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  showText = false,
  text = 'Загрузка...',
  className = '',
  fullWidth = false,
  color = 'blue',
  centered = true,
}: LoadingSpinnerProps) {
  // Определяем размеры в зависимости от параметра size
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  // Определяем цвета
  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  // Определяем дополнительные классы
  const containerClasses = [
    centered ? 'flex items-center justify-center' : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textColorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        ></div>
        {showText && (
          <div className={`mt-2 ${textColorClasses[color]}`}>{text}</div>
        )}
      </div>
    </div>
  );
}

// Интерфейс для компонента Skeleton
interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
  children?: React.ReactNode;
}

// Компонент Skeleton с градиентной анимацией
export function Skeleton({
  className = '',
  height = 'h-8',
  width = 'w-full',
  rounded = 'rounded',
  children,
}: SkeletonProps) {
  const baseClasses = 'animate-shimmer';

  const combinedClasses = [baseClasses, height, width, rounded, className]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

// Компонент для создания скелетонов текста
export function TextSkeleton({
  lines = 1,
  className = '',
  width = 'w-full',
}: {
  lines?: number;
  className?: string;
  width?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={i === lines - 1 && lines > 1 ? 'w-4/5' : width}
        />
      ))}
    </div>
  );
}

// Компонент для создания скелетона изображения
export function ImageSkeleton({
  className = '',
  height = 'h-40',
  width = 'w-full',
  rounded = 'rounded-lg',
}: {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}) {
  return (
    <Skeleton
      className={className}
      height={height}
      width={width}
      rounded={rounded}
    />
  );
}
