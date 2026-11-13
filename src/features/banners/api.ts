import 'server-only';
import type { Schemas } from '@/lib/api';
import { getPublic } from '@/lib/server-api';

export type Banner = Schemas['Banner'];

/** The banners to show now: active, within their dates, and in order. */
export async function getBanners() {
  const { data } = await getPublic<{ data: Banner[] }>('/api/banners');
  return data;
}
