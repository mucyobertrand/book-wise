'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BookImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackColor?: string;
}

const BookImageWithFallback: React.FC<BookImageWithFallbackProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fallbackColor = "#f3f4f6"
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div
        className={className}
        style={{ backgroundColor: fallbackColor }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default BookImageWithFallback;
