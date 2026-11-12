import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { env } from '@/config/env';
import { findCategory, getCategoryTree, getProduct } from '@/features/catalog/api';
import { isId } from '@/lib/search-params';
import { sortedImages } from '@/features/catalog/product';
import { summary } from '@/lib/text';
import { VariantPicker } from '@/features/catalog/VariantPicker';

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
  const [main, ...more] = sortedImages(product);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
          {main && (
            <Image
              src={main.url}
              alt={main.altText}
              fill
              preload
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        {more.length > 0 && (
          <ul className="grid grid-cols-4 gap-3">
            {more.map((image) => (
              <li key={image.id} className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  sizes="(min-width: 768px) 12vw, 25vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          {category && (
            <Link href={`/categories/${category.id}`} className="text-sm underline">
              {category.name}
            </Link>
          )}
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>
        <VariantPicker
          option1Name={product.option1Name}
          option2Name={product.option2Name}
          variants={product.variants.map(
            ({ id, option1Value, option2Value, priceCents, stock }) => ({
              id,
              option1Value,
              option2Value,
              priceCents,
              stock,
            }),
          )}
        />
        {product.description && (
          <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
        )}
      </div>
    </div>
  );
}
