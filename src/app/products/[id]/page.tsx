import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { env } from '@/config/env';
import { findCategory, getCategoryTree, getProduct } from '@/features/catalog/api';
import { isId } from '@/lib/search-params';
import { sortedImages } from '@/features/catalog/product';
import { summary } from '@/lib/text';
import { ProductListing } from '@/features/catalog/ProductListing';

async function loadProduct(params: PageProps<'/products/[id]'>['params']) {
  const { id } = await params;
  if (!isId(id)) notFound();

  return getProduct(id);
}

export async function generateMetadata({ params }: PageProps<'/products/[id]'>): Promise<Metadata> {
  const product = await loadProduct(params);
  const [image] = sortedImages(product);
  const description = summary(product.description, `Buy ${product.name} at ${env.storeName}.`);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image.url, alt: image.altText }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<'/products/[id]'>) {
  const product = await loadProduct(params);
  const category = findCategory(await getCategoryTree(), product.categoryId);

  return (
    // On phones the photos meet the header, and the bottom leaves room for the bar with Add to cart.
    <article className="-mt-6 pb-20 md:mt-0 md:pb-0">
      <ProductListing
        product={product}
        category={category ? { id: category.id, name: category.name } : null}
      />
    </article>
  );
}
