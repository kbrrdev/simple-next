'use client';

import { cn } from '@/lib/utils';
import {
  isAvailable,
  optionValues,
  selectOption,
  type Selection,
  type VariantChoice,
} from './variants';

interface OptionPickerProps {
  option1Name: string | null;
  option2Name: string | null;
  variants: VariantChoice[];
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

/** Each option's values as pills, such as sizes and colours. */
export function OptionPicker({
  option1Name,
  option2Name,
  variants,
  selection,
  onSelect,
}: OptionPickerProps) {
  const options = [
    { option: 1 as const, name: option1Name, selected: selection.option1 },
    { option: 2 as const, name: option2Name, selected: selection.option2 },
  ].filter((item) => item.name !== null);

  return (
    <>
      {options.map(({ option, name, selected }) => (
        <fieldset key={option} className="space-y-3">
          <legend className="text-sm">
            <span className="font-semibold">{name}</span>
            <span className="text-muted-foreground"> · {selected}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {optionValues(variants, option).map((value) => {
              const disabled = option === 2 && !isAvailable(variants, selection.option1, value);
              const isSelected = selected === value;

              return (
                // The highlight follows React's state, not `:has(:checked)`, which browsers do not
                // always restyle when a radio is unchecked by choosing another in its group.
                <label
                  key={value}
                  data-selected={isSelected || undefined}
                  className={cn(
                    'relative min-w-12 cursor-pointer rounded-full border border-border px-4 py-2 text-center text-sm transition-colors hover:border-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2',
                    isSelected && 'border-foreground bg-foreground text-background',
                    disabled &&
                      'cursor-not-allowed border-dashed text-muted-foreground line-through hover:border-border',
                  )}
                >
                  <input
                    type="radio"
                    name={`option${option}`}
                    value={value}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => onSelect(selectOption(variants, selection, option, value))}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </>
  );
}
