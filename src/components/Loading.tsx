export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="text-muted-foreground">
      {label}
    </p>
  );
}
