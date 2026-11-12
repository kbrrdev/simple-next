import { Field } from '@/components/Field';
import type { AddressErrors, AddressField, AddressInput } from './address';

interface AddressFormProps {
  value: AddressInput;
  errors: AddressErrors;
  onChange: (value: AddressInput) => void;
}

const fields: {
  name: AddressField;
  label: string;
  autoComplete: string;
  hint?: string;
  type?: string;
  inputMode?: 'tel' | 'numeric';
}[] = [
  { name: 'recipientName', label: 'Full name', autoComplete: 'name' },
  {
    name: 'phone',
    label: 'Mobile number',
    autoComplete: 'tel',
    type: 'tel',
    inputMode: 'tel',
    hint: 'Such as 09171234567.',
  },
  { name: 'line1', label: 'House or unit number and street', autoComplete: 'address-line1' },
  {
    name: 'line2',
    label: 'Building or subdivision (optional)',
    autoComplete: 'address-line2',
  },
  { name: 'barangay', label: 'Barangay', autoComplete: 'address-level3' },
  { name: 'city', label: 'City or municipality', autoComplete: 'address-level2' },
  {
    name: 'province',
    label: 'Province',
    autoComplete: 'address-level1',
    hint: 'Use Metro Manila for addresses in the capital region.',
  },
  {
    name: 'postalCode',
    label: 'Postal code',
    autoComplete: 'postal-code',
    inputMode: 'numeric',
  },
];

/** A Philippine shipping address. Shipping is within the Philippines only, so it has no country. */
export function AddressForm({ value, errors, onChange }: AddressFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ name, label, autoComplete, hint, type, inputMode }) => (
        <div key={name} className={name === 'line1' || name === 'line2' ? 'sm:col-span-2' : ''}>
          <Field
            id={`address-${name}`}
            label={label}
            type={type ?? 'text'}
            inputMode={inputMode}
            autoComplete={`shipping ${autoComplete}`}
            required={name !== 'line2'}
            value={value[name]}
            error={errors[name]}
            hint={hint}
            onChange={(event) => onChange({ ...value, [name]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
