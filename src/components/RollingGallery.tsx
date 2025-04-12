'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  subtitle?: string;
  keyword?: string;
  mainKeyword?: string;
}

interface RollingGalleryProps {
  images: GalleryImage[];
  autoPlayInterval?: number;
}

export default function RollingGallery({
  images,
  autoPlayInterval = 3000,
}: RollingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerOffset, setContainerOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (isMobile) {
          // For mobile, change every 2 seconds and move right
          setActiveIndex((current) => (current + 1) % images.length);
        } else if (!isMobile) {
          setActiveIndex((current) => (current + 1) % images.length);
        }
      },
      isMobile ? 4000 : autoPlayInterval
    );
    return () => clearInterval(interval);
  }, [autoPlayInterval, images.length, isMobile]);

  // Calculate visible indices
  const getVisibleIndices = () => {
    const indices = [];
    // On mobile, only show one image
    if (isMobile) {
      indices.push({ index: activeIndex, position: 0 });
    } else {
      for (let i = -2; i <= 2; i++) {
        const index = (activeIndex + i + images.length) % images.length;
        indices.push({ index, position: i });
      }
    }
    return indices;
  };

  // Calculate center offset (optional, rough mock - can adjust based on real layout)
  useEffect(() => {
    const centerImageWidth = 600;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const offset = centerImageWidth / 2 - screenWidth / 2;
    setContainerOffset(offset);
  }, [activeIndex]);

  return (
    <div className="relative w-full  overflow-hidden">
      <div
        ref={carouselRef}
        className="flex justify-center items-center cursor-grab active:cursor-grabbing h-[90%]"
      >
        <div
          className="flex items-center justify-center"
          style={{
            gap: '1.25rem',
            transform: isMobile ? 'none' : `translateX(-${containerOffset}px)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {getVisibleIndices().map(({ index, position }) => {
            const absPosition = Math.abs(position);
            const isCenter = position === 0;
            const isHovered = !isMobile && hoveredIndex === index;

            let width = '18.75rem';
            let height = '24.75rem';

            if (absPosition === 1) {
              width = '28.25rem';
              height = '35.25rem';
            }

            if (isCenter) {
              width = isHovered ? '80.25rem' : '28.25rem';
              height = '40.5625rem';
            }

            // Add responsive sizes
            if (isMobile) {
              // Small screens - single image view
              width = '80vw';
              height = '30rem';
            } else if (
              typeof window !== 'undefined' &&
              window.innerWidth <= 1024
            ) {
              // Medium screens
              if (isCenter) {
                width = isHovered ? '35rem' : '25rem';
                height = '35rem';
              } else if (absPosition === 1) {
                width = '20rem';
                height = '30rem';
              } else {
                width = '15rem';
                height = '25rem';
              }
            }

            const opacity = isMobile
              ? 1
              : absPosition === 0
              ? 1
              : absPosition === 1
              ? 0.7
              : 0.4;
            const zIndex = 10 - absPosition;

            return (
              <div
                key={`${index}-${position}`}
                className="transition-all duration-500 ease-in-out overflow-hidden rounded-lg"
                style={{
                  width,
                  height,
                  opacity,
                  zIndex,
                  aspectRatio: '25 / 33',
                }}
                onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
              >
                <div className="relative w-full h-full transition-all duration-500 ease-in-out rounded-lg overflow-hidden">
                  <Image
                    src={images[index].src}
                    alt={images[index].title}
                    fill
                    className="object-cover transition-all duration-500 object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {isCenter && (
                    <div className="absolute bottom-6 left-6 bg-opacity-50 p-2 rounded">
                      <div className="text-white text-sm sm:text-xs md:text-sm font-medium">
                        {images[index].keyword}
                      </div>
                      <div className="text-white text-xl sm:text-lg md:text-xl font-medium pb-2">
                        {images[index].mainKeyword}
                      </div>
                      <div className="text-white text-4xl sm:text-2xl md:text-3xl font-bold">
                        {images[index].title}
                      </div>
                      <div className="text-white text-xl sm:text-lg md:text-xl font-medium mt-1">
                        {images[index].subtitle}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
