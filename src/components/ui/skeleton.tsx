import { cn } from 'cn';

/** A placeholder block. Hidden from screen readers, as its container announces what is loading. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('rounded-md bg-muted motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}

export { Skeleton };
