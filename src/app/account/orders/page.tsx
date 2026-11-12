import type { Metadata } from 'next';
import { AccountPage } from '@/features/account/AccountPage';
import { OrderList } from '@/features/account/OrderList';

export const metadata: Metadata = {
  title: 'Orders',
};

export default function OrdersPage() {
  return (
    <AccountPage title="Orders">
      <OrderList />
    </AccountPage>
  );
}
