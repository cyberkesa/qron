'use client';

import { Cart } from '@/components/cart/Cart';

export default function CartPage() {
  return (
    <div className="container mx-auto px-3 md:px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ваша корзина</h1>
      <Cart />
    </div>
  );
}
