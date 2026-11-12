import { getCategoryTree, type CategoryNode } from '@/features/catalog/api';
import { CurrentSearchPill, type CategoryOption } from './SearchPill';

function flatten(nodes: CategoryNode[], prefix = ''): CategoryOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: `${prefix}${node.name}` },
    ...flatten(node.children, `${prefix}${node.name} › `),
  ]);
}

/** The search pill, with every category to search within. */
export async function HeaderSearch() {
  const categories = flatten(await getCategoryTree());
  return <CurrentSearchPill categories={categories} />;
}
