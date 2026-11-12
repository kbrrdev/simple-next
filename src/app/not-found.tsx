import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>This page does not exist, or is no longer available.</p>
      <Link href="/" className="underline">
        Go to the home page
      </Link>
    </div>
  );
}
