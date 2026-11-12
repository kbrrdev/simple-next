'use client';

import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  // Server errors arrive without details, with a digest that matches the server's logs.
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : undefined;

  return (
    <div role="alert" className="space-y-3">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p>
        This page could not be loaded. Please try again.
        {digest && ` Reference: ${digest}`}
      </p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
