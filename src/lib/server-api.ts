import 'server-only';
import { cacheLife } from 'next/cache';
import { notFound } from 'next/navigation';
import { serverEnv } from '@/config/server-env';
import { buildUrl, parseError, type Query } from './api';

/** Returns null for a 404. Errors are thrown, so they are never cached. */
async function fetchPublic<T>(path: string, query?: Query): Promise<T | null> {
  'use cache';
  // Prices and stock change, so public data is refreshed every 60 seconds.
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });

  const response = await fetch(buildUrl(serverEnv.apiUrl, path, query));

  if (response.status === 404) return null;
  if (!response.ok) throw await parseError(response);

  return (await response.json()) as T;
}

/**
 * Gets a public API route on the server, such as `{ data }` or `{ data, meta }`. A missing
 * resource shows the not-found page, which answers 404.
 */
export async function getPublic<T>(path: string, query?: Query): Promise<T> {
  const body = await fetchPublic<T>(path, query);
  if (body === null) notFound();

  return body;
}
