import { Metadata } from 'next';
import LoginClient from './login-client';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Qron | Вход',
  description: 'Войдите в свой аккаунт Qron',
};

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Providers>
        <LoginClient />
      </Providers>
    </main>
  );
}
