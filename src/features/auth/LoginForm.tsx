'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { useLogin } from './api';
import { fieldError, formError } from './errors';
import { safeNext } from './redirect';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const router = useRouter();
  const next = useSearchParams().get('next');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => router.replace(safeNext(next)) });
  }

  const emailError = fieldError(login.error, 'email');
  const passwordError = fieldError(login.error, 'password');
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        error={emailError}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        error={passwordError}
        onChange={(event) => setPassword(event.target.value)}
      />
      {login.error && !emailError && !passwordError && (
        <p role="alert" className="text-sm text-destructive">
          {formError(login.error)}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending || !email || !password}>
        {login.isPending ? 'Logging in...' : 'Log in'}
      </Button>
      <p className="text-center text-sm">
        New here?{' '}
        <Link href={registerHref} className="underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
