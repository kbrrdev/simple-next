'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Field } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { minPasswordLength, useChangePassword, useLogoutEverywhere } from '@/features/auth/api';
import { fieldError, formError } from '@/lib/form-errors';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const [changed, setChanged] = useState(false);
  const change = useChangePassword();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChanged(false);
    if (newPassword.length < minPasswordLength) {
      setTooShort(true);
      return;
    }

    setTooShort(false);
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setChanged(true);
          setCurrentPassword('');
          setNewPassword('');
        },
      },
    );
  }

  const currentError = fieldError(change.error, 'currentPassword');
  const newError = tooShort
    ? `Use at least ${minPasswordLength} characters.`
    : fieldError(change.error, 'newPassword');

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        id="current-password"
        label="Current password"
        type={showPasswords ? 'text' : 'password'}
        autoComplete="current-password"
        required
        value={currentPassword}
        error={currentError}
        onChange={(event) => setCurrentPassword(event.target.value)}
      />
      <Field
        id="new-password"
        label="New password"
        type={showPasswords ? 'text' : 'password'}
        autoComplete="new-password"
        required
        value={newPassword}
        error={newError}
        hint={`At least ${minPasswordLength} characters.`}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(event) => setShowPasswords(event.target.checked)}
        />
        Show passwords
      </label>
      {change.error && !currentError && !newError && (
        <p role="alert" className="text-sm text-destructive">
          {formError(change.error)}
        </p>
      )}
      {changed && (
        <p role="status" className="text-sm">
          Password changed. You were logged out on your other devices.
        </p>
      )}
      <Button type="submit" disabled={change.isPending || !currentPassword || !newPassword}>
        {change.isPending ? 'Changing...' : 'Change password'}
      </Button>
    </form>
  );
}

function LogoutEverywhere() {
  const [confirming, setConfirming] = useState(false);
  const logoutEverywhere = useLogoutEverywhere();
  const router = useRouter();

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Logs you out on every device, including this one. Use it if you logged in on a shared
        device, or think someone else has your password.
      </p>
      <Button variant="outline" onClick={() => setConfirming(true)}>
        Log out everywhere
      </Button>
      {confirming && (
        <ConfirmDialog
          title="Log out on every device?"
          description="You will need to log in again on every device, including this one."
          actionLabel="Log out everywhere"
          destructive
          pending={logoutEverywhere.isPending}
          error={logoutEverywhere.error}
          onConfirm={() =>
            logoutEverywhere.mutate(undefined, { onSuccess: () => router.push('/') })
          }
          onClose={() => {
            setConfirming(false);
            logoutEverywhere.reset();
          }}
        />
      )}
    </>
  );
}

export function SecuritySettings() {
  return (
    <div className="space-y-10">
      <section className="space-y-4" aria-labelledby="password-heading">
        <h2 id="password-heading" className="text-lg font-semibold">
          Change password
        </h2>
        <ChangePasswordForm />
      </section>
      <section className="space-y-4" aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="text-lg font-semibold">
          Devices
        </h2>
        <LogoutEverywhere />
      </section>
    </div>
  );
}
