'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { useRegister } from './api';
import { fieldError, formError } from '@/lib/form-errors';
import { safeNext } from './redirect';

// Mirrors the backend's rule as a hint. The backend also rejects common passwords.
const minPasswordLength = 8;

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const register = useRegister();
  const router = useRouter();
  const next = useSearchParams().get('next');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < minPasswordLength) {
      setTooShort(true);
      return;
    }

    setTooShort(false);
    register.mutate({ email, password }, { onSuccess: () => router.replace(safeNext(next)) });
  }

  const emailError = fieldError(register.error, 'email');
  const passwordError = tooShort
    ? `Use at least ${minPasswordLength} characters.`
    : fieldError(register.error, 'password');
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={emailError}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        id="password"
        label="Password"
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
      {register.error && !emailError && !passwordError && (
        <p role="alert" className="text-sm text-destructive">
          {formError(register.error)}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={register.isPending || !email || !password}
      >
        {register.isPending ? 'Creating account...' : 'Create account'}
      </Button>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link href={loginHref} className="underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
