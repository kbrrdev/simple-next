import type { Metadata } from 'next';
import { AccountPage } from '@/features/account/AccountPage';
import { AccountSummary } from '@/features/auth/AccountSummary';

export const metadata: Metadata = {
  title: 'Account',
};

export default function AccountRoute() {
  return (
    <AccountPage title="Account">
      <AccountSummary />
    </AccountPage>
  );
}
