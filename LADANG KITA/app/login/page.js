import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Ladang Kita untuk melanjutkan belanja hasil tani.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-loading">Memuat...</main>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}