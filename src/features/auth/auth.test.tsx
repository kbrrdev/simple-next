import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError, refreshSession, request } from '@/lib/api';
import { renderWithQuery } from '@/test/render';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { RequireAuth } from './RequireAuth';

const navigation = vi.hoisted(() => ({
  pathname: '/',
  search: new URLSearchParams(),
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.search,
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
}));

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  request: vi.fn(),
  refreshSession: vi.fn(),
}));

const user = {
  id: 'user-1',
  email: 'shopper@example.com',
  role: null,
  superAdmin: false,
  permissions: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const loggedIn = { data: { user, accessToken: 'token' } };

beforeEach(() => {
  navigation.pathname = '/';
  navigation.search = new URLSearchParams();
  navigation.replace.mockReset();
  vi.mocked(request).mockReset();
  vi.mocked(refreshSession).mockReset();
});

describe('LoginForm', () => {
  it('logs in for the web, and returns to the page in next', async () => {
    navigation.search = new URLSearchParams({ next: '/checkout' });
    vi.mocked(request).mockResolvedValueOnce(loggedIn);
    renderWithQuery(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'shopper@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/checkout'));
    expect(request).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: { email: 'shopper@example.com', password: 'secret-password', client: 'web' },
    });
  });

  it('ignores a next that leaves the site', async () => {
    navigation.search = new URLSearchParams({ next: '//evil.test' });
    vi.mocked(request).mockResolvedValueOnce(loggedIn);
    renderWithQuery(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'shopper@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));
  });

  it('shows the backend message next to its field', async () => {
    vi.mocked(request).mockRejectedValueOnce(
      new ApiError(400, {
        error: {
          message: 'Validation failed',
          details: [{ field: 'email', message: 'Enter a valid email' }],
        },
      }),
    );
    renderWithQuery(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'nope');
    await userEvent.type(screen.getByLabelText('Password'), 'secret-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('asks to wait after too many attempts', async () => {
    vi.mocked(request).mockRejectedValueOnce(
      new ApiError(429, { error: { message: 'Too many requests' } }),
    );
    renderWithQuery(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'shopper@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts');
  });
});

describe('RegisterForm', () => {
  it('checks the password length before sending', async () => {
    renderWithQuery(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('registers, then logs in', async () => {
    vi.mocked(request).mockResolvedValueOnce({ data: user }).mockResolvedValueOnce(loggedIn);
    renderWithQuery(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-password');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/'));
    expect(vi.mocked(request).mock.calls.map(([path]) => path)).toEqual([
      '/api/auth/register',
      '/api/auth/login',
    ]);
  });

  it('shows why the backend refused the account', async () => {
    vi.mocked(request).mockRejectedValueOnce(
      new ApiError(409, { error: { message: 'Email is already registered' } }),
    );
    renderWithQuery(<RegisterForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'taken@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'long-enough-password');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
  });
});

describe('AccountMenu', () => {
  it('offers to log in or sign up when there is no session', async () => {
    vi.mocked(refreshSession).mockResolvedValueOnce(false);
    renderWithQuery(<AccountMenu />);

    await userEvent.click(await screen.findByRole('button', { name: 'Log in or sign up' }));

    expect(await screen.findByRole('menuitem', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('menuitem', { name: 'Sign up' })).toHaveAttribute('href', '/register');
  });

  it('lists the account pages when logged in', async () => {
    vi.mocked(refreshSession).mockResolvedValueOnce(true);
    vi.mocked(request).mockResolvedValueOnce({ data: user });
    renderWithQuery(<AccountMenu />);

    await waitFor(() => expect(request).toHaveBeenCalledWith('/api/auth/me'));
    await userEvent.click(screen.getByRole('button', { name: 'Account menu' }));

    expect(await screen.findByText('shopper@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/account/orders',
    );
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  });

  it('does not restore the session on the login page', () => {
    navigation.pathname = '/login';
    renderWithQuery(<AccountMenu />);

    expect(refreshSession).not.toHaveBeenCalled();
  });
});

describe('RequireAuth', () => {
  it('sends a logged-out shopper to log in, then back', async () => {
    navigation.pathname = '/account';
    vi.mocked(refreshSession).mockResolvedValueOnce(false);
    renderWithQuery(
      <RequireAuth>
        <p>Private</p>
      </RequireAuth>,
    );

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/login?next=%2Faccount'));
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
  });

  it('shows its children to a logged-in shopper', async () => {
    vi.mocked(refreshSession).mockResolvedValueOnce(true);
    vi.mocked(request).mockResolvedValueOnce({ data: user });
    renderWithQuery(
      <RequireAuth>
        <p>Private</p>
      </RequireAuth>,
    );

    expect(await screen.findByText('Private')).toBeInTheDocument();
  });
});
