'use client';

import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  noPadding?: boolean;
  as?: 'div' | 'main' | 'section' | 'article';
}

export default function PageContainer({
  children,
  className = '',
  maxWidth = '7xl',
  noPadding = false,
  as: Component = 'div',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-none',
  };

  const paddingClasses = noPadding ? '' : 'px-3 py-4 sm:px-4 sm:py-6';

  return (
    <Component
      className={`container mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses} ${className}`}
    >
      {children}
    </Component>
  );
}
