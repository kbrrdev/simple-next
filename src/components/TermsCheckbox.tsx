import Link from 'next/link';

/**
 * The box a shopper ticks to accept the store's terms, when registering and at checkout. The links
 * open in a new tab, so that reading them does not lose the form.
 */
export function TermsCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5"
      />
      <span>
        I agree to the{' '}
        <Link href="/pages/terms" target="_blank" className="underline">
          Terms and Conditions
        </Link>{' '}
        and the{' '}
        <Link href="/pages/privacy" target="_blank" className="underline">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
