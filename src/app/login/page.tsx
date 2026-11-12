import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      {/* The form reads ?next= from the URL, which is only known in the browser. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
