import { Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FallbackImage } from '@/components/FallbackImage';
import { Pagination } from '@/components/Pagination';
import { env } from '@/config/env';
import { getBlogs } from '@/features/blogs/api';
import { formatDate } from '@/lib/dates';
import { readPage } from '@/lib/search-params';
import { summary } from '@/lib/text';

const pageSize = 12;

export const metadata: Metadata = {
  title: 'Blog',
  description: `News and guides from ${env.storeName}.`,
};

export default async function BlogsPage({ searchParams }: PageProps<'/blogs'>) {
  const page = readPage((await searchParams).page);
  const { data: blogs, meta } = await getBlogs(page, pageSize);

  return (
    <div className="space-y-8">
      <h1 className="text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">Blog</h1>
      {blogs.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <li key={blog.id}>
              <Link href={`/blogs/${blog.id}`} className="group block space-y-3">
                <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                  {blog.coverImageUrl ? (
                    <FallbackImage
                      src={blog.coverImageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Newspaper aria-hidden className="size-8" strokeWidth={1.25} />
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg leading-snug font-semibold text-balance group-hover:underline">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {blog.author} · {formatDate(blog.createdAt)}
                  </p>
                  <p className="line-clamp-2 text-sm">{summary(blog.content, '')}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination {...meta} href={(value) => (value > 1 ? `/blogs?page=${value}` : '/blogs')} />
    </div>
  );
}
