/** Products as photo cards: two columns on phones, three on tablets, and four from laptops up. */
export const productGridClass =
  'grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4';

/** The product photo's shape, shared by the cards and their skeletons. */
export const productImageClass = 'aspect-[20/19] rounded-xl';

/** Phones show a bit over two cards, hinting at more; laptops show four, like the grid. */
export const productRowClass =
  'grid auto-cols-[42%] grid-flow-col gap-3 md:auto-cols-[calc((100%-3rem)/3)] md:gap-6 lg:auto-cols-[calc((100%-4.5rem)/4)]';
