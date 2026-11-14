import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/AuthCard';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

// The link holds a private token, so this page stays out of search engines. next.config.ts also
// sends Referrer-Policy: no-referrer for it.
export const metadata: Metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set a new password" welcome="Choose a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
