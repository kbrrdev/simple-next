'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  maxAddresses,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
  type Address,
} from '@/features/addresses/api';
import {
  addressErrorsFrom,
  emptyAddress,
  formatAddress,
  validateAddress,
  type AddressErrors,
  type AddressInput,
} from '@/features/checkout/address';
import { AddressForm } from '@/features/checkout/AddressForm';
import { errorMessage } from '@/lib/api';
import { formError } from '@/lib/form-errors';
import { CardListSkeleton } from '@/components/skeletons';

function toInput(address: Address): AddressInput {
  const { recipientName, phone, line1, line2, barangay, city, province, postalCode } = address;
  return { recipientName, phone, line1, line2, barangay, city, province, postalCode };
}

interface AddressEditorProps {
  initial: AddressInput;
  saving: boolean;
  error: Error | null;
  onSave: (address: AddressInput) => void;
  onCancel: () => void;
}

function AddressEditor({ initial, saving, error, onSave, onCancel }: AddressEditorProps) {
  const [address, setAddress] = useState(initial);
  const [clientErrors, setClientErrors] = useState<AddressErrors>({});
  const serverErrors = addressErrorsFrom(error);
  const errors = { ...serverErrors, ...clientErrors };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAddress(address);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSave(address);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-border p-5"
    >
      <AddressForm value={address} errors={errors} onChange={setAddress} />
      {error && Object.keys(serverErrors).length === 0 && (
        <p role="alert" className="text-sm text-destructive">
          {formError(error)}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressBook() {
  const addresses = useAddresses();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  // 'new', an address ID being edited, or nothing.
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  if (addresses.isPending) return <CardListSkeleton label="Loading your addresses" />;
  if (addresses.error) {
    return (
      <p role="alert" className="text-destructive">
        Your addresses could not be loaded. {errorMessage(addresses.error)}
      </p>
    );
  }

  const list = addresses.data;
  const full = list.length >= maxAddresses;

  function close() {
    setEditing(null);
    create.reset();
    update.reset();
  }

  return (
    <div className="space-y-4">
      {list.length === 0 && editing !== 'new' && <p>You have no saved addresses.</p>}

      <ul className="space-y-3">
        {list.map((address) =>
          editing === address.id ? (
            <li key={address.id}>
              <AddressEditor
                initial={toInput(address)}
                saving={update.isPending}
                error={update.error}
                onSave={(input) =>
                  update.mutate({ id: address.id, address: input }, { onSuccess: close })
                }
                onCancel={close}
              />
            </li>
          ) : (
            <li key={address.id} className="space-y-3 rounded-xl border border-border p-5 text-sm">
              <div>
                <p className="font-medium">
                  {address.recipientName}
                  {address.isDefault && (
                    <span className="ml-2 rounded-full border px-2 py-0.5 text-xs font-normal">
                      Default
                    </span>
                  )}
                </p>
                <p>{address.phone}</p>
                <p>{formatAddress(address)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(address.id)}>
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={setDefault.isPending}
                    onClick={() =>
                      setDefault.mutate(address.id, {
                        onError: (error) => toast.error(errorMessage(error)),
                      })
                    }
                  >
                    Make default
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setDeleting(address)}>
                  Delete
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === 'new' ? (
        <AddressEditor
          initial={emptyAddress}
          saving={create.isPending}
          error={create.error}
          onSave={(input) => create.mutate(input, { onSuccess: close })}
          onCancel={close}
        />
      ) : full ? (
        <p className="text-sm text-muted-foreground">
          You can save up to {maxAddresses} addresses. Delete one to add another.
        </p>
      ) : (
        <Button onClick={() => setEditing('new')}>Add an address</Button>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this address?"
          description={`${deleting.recipientName}, ${formatAddress(deleting)}`}
          actionLabel="Delete address"
          destructive
          pending={remove.isPending}
          error={remove.error}
          onConfirm={() => remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onClose={() => {
            setDeleting(null);
            remove.reset();
          }}
        />
      )}
    </div>
  );
}
