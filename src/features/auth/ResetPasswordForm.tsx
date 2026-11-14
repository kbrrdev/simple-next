'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { Field } from '@/components/Field';
import { Loading } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { fieldError, formError } from '@/lib/form-errors';
import { minPasswordLength, useResetPassword } from './api';

function subscribeToNothing() {
  return () => {};
}

// Kept once read, as the address bar is cleared right after.
let capturedToken: string | null = null;

/**
 * Takes the token from `#token=...`, then removes it from the address bar, so that it is not left
 * in the history or copied with the address. It is in the fragment so that it never reaches a
 * server.
 */
function readToken() {
  const found = new URLSearchParams(window.location.hash.slice(1)).get('token');
  if (found) {
    capturedToken = found;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return capturedToken;
}

/** Undefined while the server renders, then the token or null. */
function useTokenFromHash() {
  return useSyncExternalStore(subscribeToNothing, readToken, () => undefined);
}

/** Sets a new password from the emailed link. The API then ends every session. */
export function ResetPasswordForm() {
  const token = useTokenFromHash();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const reset = useResetPassword();

  if (token === undefined) return <Loading label="Checking your link..." />;

  if (token === null) {
    return (
      <div className="space-y-4">
        <p>This link is not valid. Reset links work once, for 30 minutes.</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/forgot-password">Get a new link</Link>
        </Button>
      </div>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="space-y-4">
        <p role="status">Your password was changed. Log in with your new password.</p>
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < minPasswordLength) {
      setTooShort(true);
      return;
    }

    setTooShort(false);
    // The token is known here: the form only shows once it was found.
    if (token) reset.mutate({ token, newPassword: password });
  }

  const passwordError = tooShort
    ? `Use at least ${minPasswordLength} characters.`
    : fieldError(reset.error, 'newPassword');

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        id="new-password"
        label="New password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        required
        value={password}
        error={passwordError}
        hint={`At least ${minPasswordLength} characters.`}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        Show password
      </label>
      {reset.error && !passwordError && (
        <div role="alert" className="space-y-1 text-sm text-destructive">
          <p>{formError(reset.error)}</p>
          <p>
            If the link has expired,{' '}
            <Link href="/forgot-password" className="underline">
              get a new one
            </Link>
            .
          </p>
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={reset.isPending || !password}>
        {reset.isPending ? 'Saving...' : 'Set new password'}
      </Button>
    </form>
  );
}
