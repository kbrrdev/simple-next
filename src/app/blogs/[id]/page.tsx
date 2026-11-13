import type { Metadata } from 'next';
import { FallbackImage } from '@/components/FallbackImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogContent } from '@/features/blogs/BlogContent';
import { getBlog } from '@/features/blogs/api';
import { isId } from '@/lib/search-params';
import { summary } from '@/lib/text';
import { formatDate } from '@/lib/dates';

async function loadBlog(params: PageProps<'/blogs/[id]'>['params']) {
  const { id } = await params;
  if (!isId(id)) notFound();

  return getBlog(id);
}

export async function generateMetadata({ params }: PageProps<'/blogs/[id]'>): Promise<Metadata> {
  const blog = await loadBlog(params);
  const description = summary(blog.content, blog.title);

  return {
    title: blog.title,
    description,
    openGraph: {
      type: 'article',
      title: blog.title,
      description,
      images: blog.coverImageUrl ? [{ url: blog.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPage({ params }: PageProps<'/blogs/[id]'>) {
  const blog = await loadBlog(params);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link href="/blogs" className="text-sm underline">
        All posts
      </Link>
      <header className="space-y-1">
        <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance md:text-[2.5rem]">
          {blog.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {blog.author} · {formatDate(blog.createdAt)}
        </p>
      </header>
      {blog.coverImageUrl && (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <FallbackImage
            src={blog.coverImageUrl}
            alt=""
            fill
            preload
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <BlogContent content={blog.content} />
    </article>
  );
}
