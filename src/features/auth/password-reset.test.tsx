import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { ForgotPasswordForm } from './ForgotPasswordForm';

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
}));

/** A fresh copy, as the form keeps the token it read for the rest of the page's life. */
async function renderResetForm(hash: string) {
  window.history.replaceState(null, '', `/reset-password${hash}`);
  vi.resetModules();
  const { ResetPasswordForm } = await import('./ResetPasswordForm');
  return renderWithQuery(<ResetPasswordForm />);
}

beforeEach(() => {
  vi.mocked(request).mockReset();
});

describe('ForgotPasswordForm', () => {
  it('sends the email, and answers the same whether or not it has an account', async () => {
    vi.mocked(request).mockResolvedValue(undefined);
    renderWithQuery(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('Email'), ' shopper@example.com ');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'If shopper@example.com has an account, we sent a link',
    );
    expect(request).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'shopper@example.com' },
    });
  });

  it('says to wait after too many attempts', async () => {
    vi.mocked(request).mockRejectedValue(
      new ApiError(429, { error: { message: 'Too many requests' } }),
    );
    renderWithQuery(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'shopper@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts');
  });
});

describe('ResetPasswordForm', () => {
  it('explains a link without a token', async () => {
    await renderResetForm('');

    expect(screen.getByText(/This link is not valid/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('takes the token from the link, clears it from the address bar, and sets the password', async () => {
    vi.mocked(request).mockResolvedValue(undefined);
    await renderResetForm('#token=secret-token');

    expect(window.location.hash).toBe('');

    await userEvent.type(screen.getByLabelText('New password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('New password'), '-and-longer');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        body: { token: 'secret-token', newPassword: 'short-and-longer' },
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Your password was changed');
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('shows why the link failed, with a way to get a new one', async () => {
    vi.mocked(request).mockRejectedValue(
      new ApiError(400, { error: { message: 'This reset link is invalid or has expired' } }),
    );
    await renderResetForm('#token=old-token');

    await userEvent.type(screen.getByLabelText('New password'), 'a-good-password');
    await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('This reset link is invalid or has expired');
    expect(screen.getByRole('link', { name: 'get a new one' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
