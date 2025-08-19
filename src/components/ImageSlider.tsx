'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
  alt: string;
}

export default function ImageSlider({ images, alt }: ImageSliderProps) {
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
      <Image
        src={images[0]}
        alt={alt}
        width={1400}
        height={1400}
        className="lg:w-full lg:h-full object-cover md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] flex items-center justify-center"
      />
    );
  }

  return (
    <div className="relative group">
      <Image
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        width={1400}
        height={1400}
        className="lg:w-full lg:h-full object-cover md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] flex items-center justify-center transition-opacity duration-300"
      />

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
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-50 text-black px-2 py-1 rounded text-sm z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
