import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChoiceCardProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * A large selectable card, such as an address or a payment method. The outline follows the
 * selection state rather than `:has(:checked)`, which browsers do not always restyle.
 */
export function ChoiceCard({ name, checked, onChange, icon, children }: ChoiceCardProps) {
  return (
    <label
      data-selected={checked || undefined}
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2',
        checked
          ? 'border-foreground ring-1 ring-foreground'
          : 'border-border hover:border-foreground',
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1 text-sm">{children}</span>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-5 shrink-0 accent-foreground"
      />
    </label>
  );
}
