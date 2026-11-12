import type { Metadata } from 'next';
import { AccountPage } from '@/features/account/AccountPage';
import { SecuritySettings } from '@/features/account/SecuritySettings';

export const metadata: Metadata = {
  title: 'Security',
};

export default function SecurityPage() {
  return (
    <AccountPage title="Security">
      <SecuritySettings />
    </AccountPage>
  );
}
