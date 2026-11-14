'use client';

import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';
import { FallbackImage } from '@/components/FallbackImage';
import { cn } from '@/lib/utils';

function isIconName(name: string): name is IconName {
  return (iconNames as readonly string[]).includes(name);
}

/**
 * A category's icon, a Lucide icon name set in the admin, or else its image. It fills its parent,
 * which sets the size and the round shape.
 */
export function CategoryIcon({
  category,
  sizes,
  iconClassName,
}: {
  category: { icon: string | null; imageUrl: string | null };
  /** The image's display size, such as "24px". */
  sizes: string;
  iconClassName?: string;
}) {
  if (category.icon && isIconName(category.icon)) {
    return (
      <span className="absolute inset-0 flex items-center justify-center">
        <DynamicIcon
          name={category.icon}
          aria-hidden
          strokeWidth={1.75}
          className={cn('size-1/2', iconClassName)}
        />
      </span>
    );
  }

  if (!category.imageUrl) return null;

  return (
    <FallbackImage
      src={category.imageUrl}
      alt=""
      fill
      sizes={sizes}
      iconClassName="size-1/2"
      className="object-cover"
    />
  );
}
