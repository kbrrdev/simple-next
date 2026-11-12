import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create an account',
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      {/* The form reads ?next= from the URL, which is only known in the browser. */}
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
