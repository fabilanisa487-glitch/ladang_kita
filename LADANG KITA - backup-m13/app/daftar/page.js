import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Daftar Akun',
  description: 'Buat akun Ladang Kita untuk belanja hasil tani lokal.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="auth-loading">Memuat...</main>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}