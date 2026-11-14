import { fireEvent, render, screen } from '@testing-library/react';
import type { Schemas } from '@/lib/api';
import { BannerCarousel } from './BannerCarousel';

function banner(id: string, overrides: Partial<Schemas['Banner']> = {}): Schemas['Banner'] {
  return {
    id,
    assetId: `${id}-asset`,
    mobileAssetId: null,
    imageUrl: `http://localhost:3000/uploads/${id}.jpg`,
    mobileImageUrl: null,
    altText: `Banner ${id}`,
    title: null,
    subtitle: null,
    linkUrl: null,
    position: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('BannerCarousel', () => {
  it('shows nothing without banners', () => {
    const { container } = render(<BannerCarousel banners={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows an image-only banner without a link or arrows', () => {
    render(<BannerCarousel banners={[banner('a')]} />);

    expect(screen.getByRole('img', { name: 'Banner a' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('links a banner, with its title and subtitle as text', () => {
    render(
      <BannerCarousel
        banners={[
          banner('a', { title: 'Holiday Sale', subtitle: 'Up to 30% off', linkUrl: '/products' }),
        ]}
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products');
    expect(link).toHaveTextContent('Holiday Sale');
    expect(link).toHaveTextContent('Up to 30% off');
  });

  it('uses the phone image on phones, and the default image on wider screens', () => {
    const { container } = render(
      <BannerCarousel
        banners={[banner('a', { mobileImageUrl: 'http://localhost:3000/uploads/a-phone.jpg' })]}
      />,
    );

    expect(container.querySelector('source')?.getAttribute('srcset')).toContain('a.jpg');
    expect(screen.getByRole('img').getAttribute('srcset')).toContain('a-phone.jpg');
  });

  it('uses the default image when the phone image cannot load', () => {
    const { container } = render(
      <BannerCarousel
        banners={[
          banner('a', {
            title: 'Holiday Sale',
            mobileImageUrl: 'http://localhost:3000/uploads/a-phone.jpg',
          }),
        ]}
      />,
    );

    fireEvent.error(screen.getByRole('img'));

    const image = screen.getByRole('img', { name: 'Banner a' });
    expect(image.getAttribute('srcset')).toContain('a.jpg');
    expect(image.getAttribute('srcset')).not.toContain('a-phone.jpg');
    expect(container.querySelector('source')?.getAttribute('srcset')).toContain('a.jpg');
  });

  it('keeps the title on a plain background when no image can load', () => {
    render(<BannerCarousel banners={[banner('a', { title: 'Holiday Sale' })]} />);

    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Holiday Sale')).toBeInTheDocument();
  });

  it('labels each slide, and offers the next banner first', () => {
    render(<BannerCarousel banners={[banner('a'), banner('b'), banner('c')]} />);

    expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next banner' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous banner' })).not.toBeInTheDocument();
  });
});
