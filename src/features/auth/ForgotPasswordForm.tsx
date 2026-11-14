'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { fieldError, formError } from '@/lib/form-errors';
import { useForgotPassword } from './api';

/**
 * Asks for a reset link. The API answers the same for every email, so the message never says
 * whether the email has an account.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const forgot = useForgotPassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    forgot.mutate(email.trim());
  }

  if (forgot.isSuccess) {
    return (
      <div className="space-y-4">
        <p role="status">
          If <span className="font-semibold">{email.trim()}</span> has an account, we sent a link to
          reset its password. The link works once, for 30 minutes.
        </p>
        <p className="text-sm text-muted-foreground">
          No email? Check your spam folder, or{' '}
          <button type="button" onClick={() => forgot.reset()} className="underline">
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  const emailError = fieldError(forgot.error, 'email');

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-muted-foreground">
        Enter your email, and we will send you a link to set a new password.
      </p>
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
      {forgot.error && !emailError && (
        <p role="alert" className="text-sm text-destructive">
          {formError(forgot.error)}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={forgot.isPending || !email.trim()}
      >
        {forgot.isPending ? 'Sending...' : 'Send reset link'}
      </Button>
      <p className="text-center text-sm">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
