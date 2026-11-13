import { getCategoryTree, type CategoryNode } from '@/features/catalog/api';
import { CurrentSearchBox } from '@/features/search/CurrentSearchBox';
import { SearchScreen } from '@/features/search/SearchBox';
import type { SearchCategory } from '@/features/search/suggestions';

function flatten(nodes: CategoryNode[], parent?: string): SearchCategory[] {
  return nodes.flatMap((node) => {
    const label = parent ? `${parent} › ${node.name}` : node.name;
    return [
      { id: node.id, label, imageUrl: node.imageUrl, topLevel: !parent },
      ...flatten(node.children, label),
    ];
  });
}

async function searchCategories() {
  return flatten(await getCategoryTree());
}

/** The header's search on wide screens, with every category for its suggestions. */
export async function HeaderSearch() {
  return <CurrentSearchBox categories={await searchCategories()} />;
}

/** The phone's full-screen search, opened from the tab bar. */
export async function PhoneSearch() {
  return <SearchScreen categories={await searchCategories()} />;
}
