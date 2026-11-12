import 'server-only';
import { env } from './env';

function readServerApiUrl() {
  const value = process.env.API_URL;

  if (!value) return env.apiUrl;
  if (!URL.canParse(value)) throw new Error(`API_URL is not a valid URL: ${value}`);

  return value.replace(/\/+$/, '');
}

/** Settings for the Next.js server only. */
export const serverEnv = {
  apiUrl: readServerApiUrl(),
};
