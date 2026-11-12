import type { MetadataRoute } from 'next';
import { env } from '@/config/env';
import { getBlogs } from '@/features/blogs/api';
import { getCategoryTree, getProducts, type CategoryNode } from '@/features/catalog/api';

// The API's largest page.
const limit = 100;

/** Reads every page of a list, as the sitemap needs all of it. */
async function readAll<T>(
  getPage: (page: number) => Promise<{ data: T[]; meta: { total: number } }>,
) {
  const first = await getPage(1);
  const pages = Math.ceil(first.meta.total / limit);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) => getPage(index + 2)),
  );

  return [first, ...rest].flatMap((result) => result.data);
}

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, blogs] = await Promise.all([
    getCategoryTree(),
    readAll((page) => getProducts({ page, limit })),
    readAll((page) => getBlogs(page, limit)),
  ]);

  return [
    { url: env.siteUrl },
    { url: `${env.siteUrl}/blogs` },
    ...flatten(categories).map((category) => ({
      url: `${env.siteUrl}/categories/${category.id}`,
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      url: `${env.siteUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
    })),
    ...blogs.map((blog) => ({
      url: `${env.siteUrl}/blogs/${blog.id}`,
      lastModified: blog.updatedAt,
    })),
  ];
}
