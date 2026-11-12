import { env } from '@/config/env';
import type { components } from './api-schema';

export type Schemas = components['schemas'];
type ErrorBody = Schemas['Error'];
type ErrorDetail = NonNullable<ErrorBody['error']['details']>[number];

export class ApiError extends Error {
  readonly status: number;
  readonly details: ErrorDetail[];
  readonly requestId?: string;

  constructor(status: number, body?: ErrorBody) {
    super(body?.error.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.details = body?.error.details ?? [];
    this.requestId = body?.error.requestId;
  }
}

export type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
}

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// These answer 401 for wrong credentials or an expired cookie, so retrying them would loop.
const noRetryPaths = ['/api/auth/login', '/api/auth/refresh'];

export function buildUrl(baseUrl: string, path: string, query?: Query) {
  const url = new URL(baseUrl + path);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url;
}

export async function parseError(response: Response) {
  try {
    return new ApiError(response.status, (await response.json()) as ErrorBody);
  } catch {
    return new ApiError(response.status);
  }
}

function send(path: string, { method = 'GET', body, query }: RequestOptions) {
  const headers = new Headers();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  return fetch(buildUrl(env.apiUrl, path, query), {
    method,
    headers,
    body: payload,
    credentials: 'include',
  });
}

/** Gets a new access token from the refresh cookie. Parallel callers share one request. */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const response = await send('/api/auth/refresh', { method: 'POST', body: {} });

      if (!response.ok) {
        accessToken = null;
        return false;
      }

      const { data } = (await response.json()) as { data: { accessToken: string } };
      accessToken = data.accessToken;
      return true;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

/**
 * Sends a request to the API from the browser, and returns the parsed body, such as `{ data }`
 * or `{ data, meta }`. On a 401, it refreshes the session once and retries once.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options);

  if (response.status === 401 && !noRetryPaths.includes(path) && (await refreshSession())) {
    response = await send(path, options);
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** A message for the shopper. Unexpected errors include the reference support needs. */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      const reference = error.requestId ? ` Reference: ${error.requestId}` : '';
      return `Something went wrong on the server.${reference}`;
    }
    return error.message;
  }

  return 'Could not reach the server. Check your connection and try again.';
}
