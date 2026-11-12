'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCents } from '@/lib/money';
import { cn } from '@/lib/utils';
import {
  findVariant,
  initialSelection,
  isAvailable,
  optionValues,
  selectOption,
  type VariantChoice,
} from './variants';

interface VariantPickerProps {
  option1Name: string | null;
  option2Name: string | null;
  variants: VariantChoice[];
}

export function VariantPicker({ option1Name, option2Name, variants }: VariantPickerProps) {
  const [selection, setSelection] = useState(() => initialSelection(variants));
  const variant = findVariant(variants, selection);
  const inStock = (variant?.stock ?? 0) > 0;

  const options = [
    { option: 1 as const, name: option1Name, selected: selection.option1 },
    { option: 2 as const, name: option2Name, selected: selection.option2 },
  ].filter((item) => item.name !== null);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-2xl font-semibold">{variant && formatCents(variant.priceCents)}</p>
        <p className={cn('text-sm', inStock ? 'text-muted-foreground' : 'text-destructive')}>
          {inStock ? 'In stock' : 'Out of stock'}
        </p>
      </div>

      {options.map(({ option, name, selected }) => (
        <fieldset key={option} className="space-y-2">
          <legend className="text-sm font-medium">
            {name}: <span className="font-normal">{selected}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {optionValues(variants, option).map((value) => {
              const disabled = option === 2 && !isAvailable(variants, selection.option1, value);

              return (
                <label
                  key={value}
                  className={cn(
                    'cursor-pointer rounded-md border px-3 py-1.5 text-sm has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-2 has-focus-visible:ring-ring',
                    disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <input
                    type="radio"
                    name={`option${option}`}
                    value={value}
                    checked={selected === value}
                    disabled={disabled}
                    onChange={() => setSelection(selectOption(variants, selection, option, value))}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* The cart is built in a later step. */}
      <Button size="lg" className="w-full sm:w-auto" disabled>
        Add to cart
      </Button>
    </div>
  );
}
