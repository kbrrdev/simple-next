import 'server-only';
import type { Schemas } from '@/lib/api';
import { getPublic } from '@/lib/server-api';

export type StoreInfo = Schemas['StoreInfo'];
export type ContentPage = Schemas['ContentPage'];

export async function getStoreInfo() {
  const { data } = await getPublic<{ data: StoreInfo }>('/api/store-info');
  return data;
}

/** Published pages, such as the terms and privacy policy, without their content. */
export async function getPages() {
  const { data } = await getPublic<{ data: Schemas['ContentPageSummary'][] }>('/api/pages');
  return data;
}

/** A published page. A draft or a missing page shows the not-found page. */
export async function getPage(slug: string) {
  const { data } = await getPublic<{ data: ContentPage }>(`/api/pages/${slug}`);
  return data;
}
