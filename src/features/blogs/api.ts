import 'server-only';
import type { Schemas } from '@/lib/api';
import { getPublic } from '@/lib/server-api';

export type Blog = Schemas['Blog'];

export function getBlogs(page: number, limit: number) {
  return getPublic<{ data: Blog[]; meta: Schemas['PageMeta'] }>('/api/blogs', { page, limit });
}

export async function getBlog(id: string) {
  const { data } = await getPublic<{ data: Blog }>(`/api/blogs/${id}`);
  return data;
}
