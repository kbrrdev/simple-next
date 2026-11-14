import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/AuthCard';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot your password',
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot your password" welcome="Reset your password">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
