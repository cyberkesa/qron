'use client';

import { Cart } from '@/components/cart/Cart';

export default function CartPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ваша корзина</h1>
      <Cart />
    </main>
  );
}
