/** A value from `searchParams`, which repeats as an array when a name appears twice. */
export type SearchParam = string | string[] | undefined;

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function firstValue(value: SearchParam) {
  return Array.isArray(value) ? value[0] : value;
}

/** The API only addresses records by UUID, and answers 400 for anything else. */
export function isId(value: string) {
  return uuid.test(value);
}

/** A page number of 1 or more. Anything else falls back to the first page. */
export function readPage(value: SearchParam) {
  const page = Number(firstValue(value));
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}
