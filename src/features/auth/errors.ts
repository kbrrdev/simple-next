import { ApiError, errorMessage } from '@/lib/api';

/** The backend's message for one field, shown next to it. */
export function fieldError(error: Error | null, field: string) {
  return error instanceof ApiError
    ? error.details.find((detail) => detail.field === field)?.message
    : undefined;
}

export function formError(error: Error) {
  if (error instanceof ApiError && error.status === 429) {
    return 'Too many attempts. Wait a few minutes, then try again.';
  }
  return errorMessage(error);
}
