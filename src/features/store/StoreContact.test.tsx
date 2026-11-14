import { render, screen } from '@testing-library/react';
import type { Schemas } from '@/lib/api';
import { StoreContact } from './StoreContact';

const empty: Schemas['StoreInfo'] = {
  name: 'Sample Store',
  email: null,
  phone: null,
  line1: null,
  line2: null,
  barangay: null,
  city: null,
  province: null,
  postalCode: null,
  businessHours: null,
  socialLinks: [],
  updatedAt: '2026-11-14T00:00:00.000Z',
};

function renderContact(info: Partial<Schemas['StoreInfo']>) {
  return render(
    <ul>
      <StoreContact info={{ ...empty, ...info }} />
    </ul>,
  );
}

describe('StoreContact', () => {
  it('shows each detail the store filled in, with links to email, call, and follow', () => {
    renderContact({
      email: 'hello@example.com',
      phone: '0917 123 4567',
      line1: '123 Rizal Street',
      city: 'Makati',
      postalCode: '1210',
      businessHours: 'Mon to Sat, 9am to 6pm',
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com/example', label: null },
        { platform: 'shopee', url: 'https://shopee.ph/example', label: 'Shopee Mall' },
      ],
    });

    expect(screen.getByRole('link', { name: 'hello@example.com' })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    );
    expect(screen.getByRole('link', { name: '0917 123 4567' })).toHaveAttribute(
      'href',
      'tel:09171234567',
    );
    expect(screen.getByText('123 Rizal Street, Makati, 1210')).toBeInTheDocument();
    expect(screen.getByText('Mon to Sat, 9am to 6pm')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://facebook.com/example',
    );
    expect(screen.getByRole('link', { name: 'Shopee Mall' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('leaves out what the store left empty', () => {
    renderContact({});

    expect(screen.queryAllByRole('listitem')).toEqual([]);
  });
});
