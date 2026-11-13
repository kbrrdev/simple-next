import type { ReactNode } from 'react';

/**
 * Login and registration as a centred card, with a title bar and a welcome line. Phones show it
 * without the card's frame, using the whole width.
 */
export function AuthCard({
  title,
  welcome,
  children,
}: {
  title: string;
  welcome: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[35rem] md:pt-6">
      <div className="md:rounded-xl md:border md:border-border md:shadow-float">
        <div className="border-b border-hairline pb-4 text-center md:px-6 md:pt-4">
          <h1 className="font-semibold">{title}</h1>
        </div>
        <div className="space-y-6 pt-6 md:px-6 md:pb-6">
          <p className="text-[1.375rem] font-semibold tracking-tight">{welcome}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
