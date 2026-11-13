import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false },
};

// Each page guards itself with RequireAuth, so that this layout always renders its page, and
// Next.js can check the page for instant navigation.
export default function AccountLayout({ children }: LayoutProps<'/account'>) {
  return <div className="mx-auto max-w-4xl">{children}</div>;
}
