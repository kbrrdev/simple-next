import type { Order, OrderStatus } from './api';

export const statusLabels: Record<OrderStatus, string> = {
  awaiting_payment: 'Waiting for payment',
  pending: 'Being prepared',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const orderStatuses = Object.keys(statusLabels) as OrderStatus[];

export const paymentLabels: Record<Order['paymentStatus'], string> = {
  unpaid: 'Not paid',
  submitted: 'Payment reference sent, waiting for confirmation',
  paid: 'Paid',
  refunded: 'Refunded',
};
