'use client';

import { ArrowLeft, LayoutGrid, Loader2, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { FallbackImage } from '@/components/FallbackImage';
import { priceRange, sortedImages } from '@/features/catalog/product';
import { formatCents } from '@/lib/money';
import { cn } from '@/lib/utils';
import { searchScreen, useSearchScreenOpen } from './search-screen';
import {
  matchCategories,
  minQueryLength,
  splitMatches,
  useProductSuggestions,
  type SearchCategory,
} from './suggestions';

/** The tab bar's Search tab, which gets focus back when the screen closes. */
export const searchTabId = 'search-tab';

interface Option {
  key: string;
  href: string;
  tile: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
}

interface Section {
  title?: string;
  options: Option[];
  note?: ReactNode;
}

function searchHref(query: string) {
  const term = query.trim();
  return term ? `/search?q=${encodeURIComponent(term)}` : '/search';
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitMatches(text, query).map((part, index) =>
        part.match ? (
          <strong key={index} className="font-semibold">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

function Tile({ children }: { children: ReactNode }) {
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground">
      {children}
    </span>
  );
}

function categoryOption(category: SearchCategory, query: string): Option {
  return {
    key: `category-${category.id}`,
    href: `/categories/${category.id}`,
    tile: category.imageUrl ? (
      <FallbackImage
        src={category.imageUrl}
        alt=""
        fill
        sizes="48px"
        iconClassName="size-4"
        className="object-cover"
      />
    ) : (
      <LayoutGrid aria-hidden className="size-5" strokeWidth={1.5} />
    ),
    title: <Highlighted text={category.label} query={query} />,
    detail: 'Category',
  };
}

/** What the panel lists: categories to browse before typing, then products and categories. */
function useSections(query: string, categories: SearchCategory[]) {
  const products = useProductSuggestions(query);
  const typed = query.trim();

  if (typed.length < minQueryLength) {
    const browse = categories.filter((category) => category.topLevel);
    return browse.length > 0
      ? [{ title: 'Browse categories', options: browse.map((c) => categoryOption(c, '')) }]
      : [];
  }

  const sections: Section[] = [];
  // Waits for the debounced term to catch up, so stale results never show for new text.
  const settled = products.term === typed && !products.isFetching;

  if (!settled && !products.isError) {
    sections.push({
      title: 'Products',
      options: [],
      note: (
        <span className="flex items-center gap-2">
          <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
          Searching…
        </span>
      ),
    });
  } else if (products.data && products.data.length > 0) {
    sections.push({
      title: 'Products',
      options: products.data.map((product) => {
        const [image] = sortedImages(product);
        const { min, max } = priceRange(product.variants);
        return {
          key: `product-${product.id}`,
          href: `/products/${product.id}`,
          tile: image ? (
            <FallbackImage
              src={image.url}
              alt=""
              fill
              sizes="48px"
              iconClassName="size-4"
              className="object-cover"
            />
          ) : null,
          title: <Highlighted text={product.name} query={typed} />,
          detail: (
            <span className="tabular-nums">
              {min !== max && 'from '}
              {formatCents(min)}
            </span>
          ),
        };
      }),
    });
  } else if (products.data) {
    sections.push({ options: [], note: `No products match "${typed}".` });
  }

  const matched = matchCategories(categories, typed);
  if (matched.length > 0) {
    sections.push({ title: 'Categories', options: matched.map((c) => categoryOption(c, typed)) });
  }

  sections.push({
    options: [
      {
        key: 'all',
        href: searchHref(typed),
        tile: <Search aria-hidden className="size-5" strokeWidth={1.75} />,
        title: (
          <>
            See all results for <strong className="font-semibold">“{typed}”</strong>
          </>
        ),
      },
    ],
  });

  return sections;
}

interface PanelProps {
  id: string;
  sections: Section[];
  active: number;
  onHover: (index: number) => void;
  onChoose: (option: Option) => void;
}

function Panel({ id, sections, active, onHover, onChoose }: PanelProps) {
  // Each section's first position in the one list the arrow keys move through.
  const starts = sections.map((_, sectionIndex) =>
    sections.slice(0, sectionIndex).reduce((total, section) => total + section.options.length, 0),
  );

  return (
    <div id={id} role="listbox" aria-label="Search suggestions" className="py-2">
      {sections.map((section, sectionIndex) => (
        <div
          key={section.title ?? `section-${sectionIndex}`}
          role="group"
          aria-label={section.title}
          className={cn(sectionIndex > 0 && 'mt-2 border-t border-hairline pt-2')}
        >
          {section.title && (
            <div role="presentation" className="px-6 pt-3 pb-1 text-xs font-semibold">
              {section.title}
            </div>
          )}
          {section.note && (
            <div role="presentation" className="px-6 py-3 text-sm text-muted-foreground">
              {section.note}
            </div>
          )}
          {section.options.map((option, optionIndex) => {
            const position = starts[sectionIndex] + optionIndex;
            return (
              <div
                key={option.key}
                id={`${id}-${position}`}
                role="option"
                aria-selected={position === active}
                // Keeps the field focused, so choosing never closes the panel first.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => onHover(position)}
                onClick={() => onChoose(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-4 px-4 py-2 sm:mx-2 sm:rounded-xl',
                  position === active && 'bg-muted',
                )}
              >
                <Tile>{option.tile}</Tile>
                <span className="min-w-0">
                  <span className="block truncate text-[0.9375rem]">{option.title}</span>
                  {option.detail && (
                    <span className="block text-sm text-muted-foreground">{option.detail}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface FieldProps {
  listboxId: string;
  expanded: boolean;
  query: string;
  activeId?: string;
  autoFocus?: boolean;
  onQuery: (value: string) => void;
  onFocus?: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

/** The pill: the field, a clear button while there is text, and the round search button. */
function Field({
  listboxId,
  expanded,
  query,
  activeId,
  autoFocus,
  onQuery,
  onFocus,
  onKeyDown,
  onSubmit,
  className,
}: FieldProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    // Works as a plain search form before the page's script loads.
    <form
      action="/search"
      role="search"
      onSubmit={onSubmit}
      className={cn(
        'flex items-center rounded-full border border-border bg-background shadow-raise transition-shadow focus-within:shadow-float hover:shadow-float',
        className,
      )}
    >
      <input
        ref={input}
        name="q"
        type="search"
        role="combobox"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={activeId}
        autoComplete="off"
        autoFocus={autoFocus}
        maxLength={255}
        placeholder="Search products"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className="h-full min-w-0 flex-1 bg-transparent pl-6 text-[0.9375rem] outline-none placeholder:text-muted-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onQuery('');
            input.current?.focus();
          }}
          className="mx-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="mr-1.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:bg-brand-hover"
      >
        <Search aria-hidden className="size-4" strokeWidth={2.75} />
      </button>
    </form>
  );
}

/** What one search box needs: the text, the open list, the highlighted row, and the keys. */
function useSearchController(
  categories: SearchCategory[],
  initialQuery: string,
  onClose: () => void,
) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const sections = useSections(query, categories);
  const options = sections.flatMap((section) => section.options);

  function close() {
    setOpen(false);
    setActive(-1);
    onClose();
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setActive(-1);
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (options.length === 0) return;
      // -1 is the field itself, between the last row and the first.
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => {
        const next = current + step;
        if (next >= options.length) return -1;
        if (next < -1) return options.length - 1;
        return next;
      });
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosen = active >= 0 ? options[active] : undefined;
    go(chosen?.href ?? searchHref(query));
  }

  return {
    query,
    open,
    setOpen,
    active,
    setActive,
    sections,
    options,
    close,
    go,
    changeQuery,
    handleKeyDown,
    handleSubmit,
  };
}

/**
 * The header's product search on wide screens. As the shopper types it suggests matching
 * products and categories, and before they type it offers the categories to browse.
 */
export function SearchBox({
  categories,
  initialQuery = '',
}: {
  categories: SearchCategory[];
  initialQuery?: string;
}) {
  const listboxId = `${useId()}-panel`;
  const wrapper = useRef<HTMLDivElement>(null);
  const search = useSearchController(categories, initialQuery, () => {});
  const activeId = search.active >= 0 ? `${listboxId}-${search.active}` : undefined;

  return (
    <div
      ref={wrapper}
      className="relative w-full max-w-xl"
      onBlur={(event) => {
        if (!wrapper.current?.contains(event.relatedTarget)) search.close();
      }}
    >
      <span aria-live="polite" className="sr-only">
        {search.open ? `${search.options.length} suggestions` : ''}
      </span>
      <Field
        listboxId={listboxId}
        expanded={search.open}
        query={search.query}
        activeId={search.open ? activeId : undefined}
        onQuery={search.changeQuery}
        onFocus={() => search.setOpen(true)}
        onKeyDown={search.handleKeyDown}
        onSubmit={search.handleSubmit}
        className="h-14"
      />
      {search.open && search.sections.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-3 max-h-[min(36rem,70vh)] overflow-y-auto rounded-3xl border border-hairline bg-background shadow-float">
          <Panel
            id={listboxId}
            sections={search.sections}
            active={search.active}
            onHover={search.setActive}
            onChoose={(option) => search.go(option.href)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The phone's full-screen search, opened from the tab bar. The tab bar stays in view above it,
 * and moving to any page closes it.
 */
export function SearchScreen({ categories }: { categories: SearchCategory[] }) {
  const open = useSearchScreenOpen();
  const pathname = usePathname();

  // Any page change, from a tab, a suggestion, or Back, closes the screen.
  useEffect(() => {
    searchScreen.close();
  }, [pathname]);

  // The page behind the screen stays still.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;
  return <SearchScreenContent categories={categories} />;
}

function SearchScreenContent({ categories }: { categories: SearchCategory[] }) {
  const listboxId = `${useId()}-screen`;
  const initialQuery = useSearchParams().get('q') ?? '';
  const search = useSearchController(categories, initialQuery, () => {
    searchScreen.close();
    document.getElementById(searchTabId)?.focus();
  });
  const activeId = search.active >= 0 ? `${listboxId}-${search.active}` : undefined;

  return (
    <div
      role="dialog"
      aria-label="Search"
      className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-45 flex flex-col bg-background md:hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
    >
      <span aria-live="polite" className="sr-only">
        {`${search.options.length} suggestions`}
      </span>
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
        <button
          type="button"
          aria-label="Close search"
          onClick={search.close}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <Field
          listboxId={listboxId}
          expanded
          query={search.query}
          activeId={activeId}
          autoFocus
          onQuery={search.changeQuery}
          onKeyDown={search.handleKeyDown}
          onSubmit={search.handleSubmit}
          className="h-12 flex-1"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Panel
          id={listboxId}
          sections={search.sections}
          active={search.active}
          onHover={search.setActive}
          onChoose={(option) => search.go(option.href)}
        />
      </div>
    </div>
  );
}
