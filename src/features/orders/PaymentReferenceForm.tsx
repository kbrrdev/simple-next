'use client';

import type { UseMutationResult } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { fieldError, formError } from '@/lib/form-errors';

// Mirrors the backend's rule as a hint. The backend remains the authority.
const referencePattern = /^[A-Za-z0-9-]{4,100}$/;

interface PaymentReferenceFormProps {
  providerName: string | null;
  submit: UseMutationResult<unknown, Error, string>;
}

/** Sends the reference of a payment made outside the store, for the store to confirm. */
export function PaymentReferenceForm({ providerName, submit }: PaymentReferenceFormProps) {
  const [reference, setReference] = useState('');
  const [hint, setHint] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = reference.trim();

    if (!referencePattern.test(value)) {
      setHint('Use 4 to 100 letters, numbers, or hyphens, as shown on your receipt.');
      return;
    }
    setHint(undefined);
    submit.mutate(value);
  }

  const error = hint ?? fieldError(submit.error, 'reference');

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Field
        id="payment-reference"
        label={`${providerName ?? 'Payment'} reference number`}
        autoComplete="off"
        required
        value={reference}
        error={error}
        hint="Find it on your payment receipt or confirmation message."
        onChange={(event) => setReference(event.target.value)}
      />
      {submit.error && !error && (
        <p role="alert" className="text-sm text-destructive">
          {formError(submit.error)}
        </p>
      )}
      <Button type="submit" disabled={submit.isPending || !reference.trim()}>
        {submit.isPending ? 'Sending...' : 'Send payment reference'}
      </Button>
    </form>
  );
}
