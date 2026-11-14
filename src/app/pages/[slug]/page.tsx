import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogContent } from '@/features/blogs/BlogContent';
import { getPage } from '@/features/store/api';
import { formatDate } from '@/lib/dates';
import { isSlug } from '@/lib/search-params';
import { summary } from '@/lib/text';

async function loadPage(params: PageProps<'/pages/[slug]'>['params']) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  return getPage(slug);
}

export async function generateMetadata({ params }: PageProps<'/pages/[slug]'>): Promise<Metadata> {
  const page = await loadPage(params);
  return { title: page.title, description: summary(page.content, page.title) };
}

/** A store page, such as the terms, privacy policy, or returns policy. */
export default async function ContentPage({ params }: PageProps<'/pages/[slug]'>) {
  const page = await loadPage(params);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance md:text-[2.5rem]">
          {page.title}
        </h1>
        <p className="text-sm text-muted-foreground">Last updated {formatDate(page.updatedAt)}</p>
      </header>
      <BlogContent content={page.content} />
    </article>
  );
}
