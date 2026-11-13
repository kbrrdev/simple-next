import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/config/env';
import { AuthCard } from '@/features/auth/AuthCard';
import { RegisterForm } from '@/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an account',
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <AuthCard title="Create an account" welcome={`Welcome to ${env.storeName}`}>
      {/* The form reads ?next= from the URL, which is only known in the browser. */}
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}
