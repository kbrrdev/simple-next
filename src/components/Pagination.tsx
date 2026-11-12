import Link from 'next/link';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  /** The link to a page, keeping the list's other filters. */
  href: (page: number) => string;
}

export function Pagination({ page, limit, total, href }: PaginationProps) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-6 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="underline">
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="underline">
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
