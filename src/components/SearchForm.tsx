import Form from 'next/form';

export function SearchForm() {
  return (
    <Form action="/search" role="search" className="flex-1 sm:max-w-xs">
      <label htmlFor="search" className="sr-only">
        Search products
      </label>
      <input
        id="search"
        name="q"
        type="search"
        placeholder="Search products"
        maxLength={255}
        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
      />
    </Form>
  );
}
