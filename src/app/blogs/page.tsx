import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';
import { env } from '@/config/env';
import { getBlogs } from '@/features/blogs/api';
import { readPage } from '@/lib/search-params';
import { summary } from '@/lib/text';
import { formatDate } from '@/lib/dates';

const pageSize = 10;

export const metadata: Metadata = {
  title: 'Blog',
  description: `News and guides from ${env.storeName}.`,
};

export default async function BlogsPage({ searchParams }: PageProps<'/blogs'>) {
  const page = readPage((await searchParams).page);
  const { data: blogs, meta } = await getBlogs(page, pageSize);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Blog</h1>
      {blogs.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="divide-y">
          {blogs.map((blog) => (
            <li key={blog.id} className="space-y-1 py-4">
              <h2 className="text-lg font-medium">
                <Link href={`/blogs/${blog.id}`} className="hover:underline">
                  {blog.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground">
                {blog.author} · {formatDate(blog.createdAt)}
              </p>
              <p>{summary(blog.content, '')}</p>
            </li>
          ))}
        </ul>
      )}
      <Pagination {...meta} href={(value) => (value > 1 ? `/blogs?page=${value}` : '/blogs')} />
    </div>
  );
}
