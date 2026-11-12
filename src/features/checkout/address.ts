import type { Schemas } from '@/lib/api';
import { ApiError } from '@/lib/api';

export type AddressInput = Required<Schemas['CreateAddress']>;
export type AddressField = keyof AddressInput;
export type AddressErrors = Partial<Record<AddressField, string>>;

export const emptyAddress: AddressInput = {
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  barangay: '',
  city: '',
  province: '',
  postalCode: '',
};

const requiredFields: AddressField[] = [
  'recipientName',
  'phone',
  'line1',
  'barangay',
  'city',
  'province',
  'postalCode',
];

/**
 * Checks the address before sending it. These mirror the backend's rules as hints, and the
 * backend's errors remain the authority.
 */
export function validateAddress(address: AddressInput): AddressErrors {
  const errors: AddressErrors = {};

  for (const field of requiredFields) {
    if (!address[field].trim()) errors[field] = 'Required.';
  }
  if (address.phone.trim() && !/^(\+63|0)9\d{9}$/.test(address.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Use a Philippine mobile number, such as 09171234567.';
  }
  if (address.postalCode.trim() && !/^\d{4}$/.test(address.postalCode.trim())) {
    errors.postalCode = 'Use the 4-digit postal code.';
  }

  return errors;
}

/**
 * The backend's address errors by field. A guest order names them `address.phone`, and a saved
 * address names them `phone`.
 */
export function addressErrorsFrom(error: Error | null): AddressErrors {
  if (!(error instanceof ApiError)) return {};

  const errors: AddressErrors = {};
  for (const { field, message } of error.details) {
    const name = field.replace(/^address\./, '');
    if (name in emptyAddress) errors[name as AddressField] = message;
  }
  return errors;
}

export function formatAddress(address: Omit<AddressInput, 'recipientName' | 'phone'>) {
  return [address.line1, address.line2, address.barangay, address.city, address.province]
    .filter(Boolean)
    .join(', ')
    .concat(` ${address.postalCode}`);
}
