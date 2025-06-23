'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface MobileProductBarProps {
  product?: {
    id: string;
    name: string;
    price: number;
    available?: boolean;
  };
  currentCartQuantity?: number;
  isAddingToCart?: boolean;
  notAvailableInRegion?: boolean;
  onAddToCart?: () => Promise<void>;
  onUpdateQuantity?: (delta: number) => Promise<void>;
  formatPrice?: (price: number) => string;
}

export const MobileProductBar: React.FC<MobileProductBarProps> = () => {
  // Отключаем функциональность компонента, всегда возвращаем null
  return null;
};

export default MobileProductBar;
