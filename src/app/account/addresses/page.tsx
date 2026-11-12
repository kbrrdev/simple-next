import type { Metadata } from 'next';
import { AccountPage } from '@/features/account/AccountPage';
import { AddressBook } from '@/features/account/AddressBook';

export const metadata: Metadata = {
  title: 'Addresses',
};

export default function AddressesPage() {
  return (
    <AccountPage title="Addresses">
      <AddressBook />
    </AccountPage>
  );
}
