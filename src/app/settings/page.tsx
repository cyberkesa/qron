'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Настройки</h1>
        <p className="text-gray-600 mb-6">
          Страница настроек пока в разработке. В будущем здесь можно будет
          управлять параметрами аккаунта.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          В личный кабинет
        </Link>
      </div>
    </main>
  );
}
