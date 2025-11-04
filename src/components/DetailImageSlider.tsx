'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DetailImageSliderProps {
  images: string[];
  alt: string;
}

export default function DetailImageSlider({
  images,
  alt,
}: DetailImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (images.length === 1) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-contain transition-opacity duration-300"
          priority
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70 z-10"
        aria-label="Previous image"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextImage}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70 z-10"
        aria-label="Next image"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
