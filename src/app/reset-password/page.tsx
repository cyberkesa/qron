import { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordClient from './reset-password-client';
import ResetPasswordLoading from './loading';

export const metadata: Metadata = {
  title: 'Восстановление пароля | КРОН',
  description: 'Восстановление доступа к аккаунту',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
