import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './login-client';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'КРОН | Вход',
  description: 'Войдите в свой аккаунт КРОН',
};

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <Providers>
        <Suspense fallback={<div>Загрузка...</div>}>
          <LoginClient />
        </Suspense>
      </Providers>
    </main>
  );
}
