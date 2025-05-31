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
    <Providers>
      <Suspense fallback={<div>Загрузка...</div>}>
        <LoginClient />
      </Suspense>
    </Providers>
  );
}
