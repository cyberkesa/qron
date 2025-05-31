import React from 'react';

/**
 * Компонент для предотвращения layout shifts
 */
export const LayoutShiftPrevention: React.FC<{
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  className?: string;
}> = ({ children, width, height, aspectRatio, className = '' }) => {
  const style: React.CSSProperties = {};

  if (width) style.width = width;
  if (height) style.height = height;
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <div className={`${className}`} style={style}>
      {children}
    </div>
  );
};

/**
 * Скелетон для предотвращения layout shifts
 */
export const SkeletonLoader: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  rounded?: boolean;
}> = ({ width = '100%', height = '1rem', className = '', rounded = false }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Контейнер для изображений с фиксированным соотношением сторон
 */
export const ImageContainer: React.FC<{
  children: React.ReactNode;
  aspectRatio?: string;
  className?: string;
}> = ({ children, aspectRatio = '1/1', className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {children}
    </div>
  );
};

export default LayoutShiftPrevention;
