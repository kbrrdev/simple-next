import { render, screen } from '@testing-library/react';
import { ScrollRow } from './ScrollRow';

// ScrollRow watches its size. jsdom does not lay out pages.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

describe('ScrollRow', () => {
  // An absolutely placed child, such as Price's screen reader label, is placed against its
  // nearest positioned ancestor. If that is outside the scrolling element, it escapes the clip
  // and widens the page on phones.
  it('keeps absolutely placed content inside the scrolling element', () => {
    render(
      <ScrollRow label="Products">
        <span className="sr-only">was</span>
      </ScrollRow>,
    );

    expect(screen.getByRole('group', { name: 'Products' })).toHaveClass(
      'relative',
      'overflow-x-auto',
    );
  });
});
