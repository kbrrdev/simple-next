import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/features/auth/AuthCard';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthCard title="Log in" welcome="Welcome back">
      {/* The form reads ?next= from the URL, which is only known in the browser. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
