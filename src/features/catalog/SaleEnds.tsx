'use client';

import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const hour = 60 * 60 * 1000;
const day = 24 * hour;

/** "2d 4h" while more than a day is left, then "3h 05m 09s", or null once it has ended. */
export function timeLeft(ms: number) {
  if (ms <= 0) return null;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  if (days > 0) return `${days}d ${hours}h`;

  const minutes = Math.floor((ms % hour) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
}

/**
 * When a sale price ends. It counts down each second in the last day. The server does not know
 * the shopper's clock, so it renders nothing until the page runs in the browser.
 */
export function SaleEnds({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  const end = new Date(endsAt).getTime();

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const left = now === null ? null : timeLeft(end - now);
  if (!left) return null;

  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-sale">
      <Clock aria-hidden className="size-4" />
      Sale ends in {left}
    </p>
  );
}
