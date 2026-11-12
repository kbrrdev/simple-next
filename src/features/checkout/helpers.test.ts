import { ApiError } from '@/lib/api';
import { addressErrorsFrom, emptyAddress, validateAddress } from './address';
import { nextAttempt } from './attempt';

describe('nextAttempt', () => {
  const newKey = vi.fn(() => 'new-key');

  it('reuses the key when the same order is retried', () => {
    const first = nextAttempt(null, 'order-a', newKey);
    expect(nextAttempt(first, 'order-a', () => 'other-key')).toBe(first);
  });

  it('makes a new key when the order changes', () => {
    const first = { signature: 'order-a', idempotencyKey: 'old-key' };
    expect(nextAttempt(first, 'order-b', newKey)).toEqual({
      signature: 'order-b',
      idempotencyKey: 'new-key',
    });
  });
});

describe('validateAddress', () => {
  const valid = {
    ...emptyAddress,
    recipientName: 'Juan Dela Cruz',
    phone: '0917 123 4567',
    line1: '123 Rizal Street',
    barangay: 'San Antonio',
    city: 'Pasig',
    province: 'Metro Manila',
    postalCode: '1605',
  };

  it('accepts a complete address, without the optional second line', () => {
    expect(validateAddress(valid)).toEqual({});
  });

  it('marks missing fields and wrong formats', () => {
    expect(validateAddress({ ...valid, city: ' ', phone: '12345', postalCode: '160' })).toEqual({
      city: 'Required.',
      phone: 'Use a Philippine mobile number, such as 09171234567.',
      postalCode: 'Use the 4-digit postal code.',
    });
  });
});

describe('addressErrorsFrom', () => {
  it("reads both a guest order's and a saved address's field names", () => {
    const error = new ApiError(400, {
      error: {
        message: 'Validation failed',
        details: [
          { field: 'address.phone', message: 'Bad phone' },
          { field: 'postalCode', message: 'Bad code' },
          { field: 'email', message: 'Bad email' },
        ],
      },
    });

    expect(addressErrorsFrom(error)).toEqual({ phone: 'Bad phone', postalCode: 'Bad code' });
  });
});
