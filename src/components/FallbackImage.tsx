'use client';

import { ImageOff } from 'lucide-react';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A `next/image` that shows a quiet placeholder when the photo cannot load, rather than the
 * browser's broken-image icon and alt text. Its parent supplies the shape and background.
 */
export function FallbackImage({
  alt,
  className,
  iconClassName,
  ...props
}: ImageProps & { iconClassName?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <ImageOff aria-hidden className={cn('size-8', iconClassName)} strokeWidth={1.25} />
      </span>
    );
  }

  return <Image {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}
