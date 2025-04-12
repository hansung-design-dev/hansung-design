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

interface ProgressiveCarouselProps {
  images: GalleryImage[];
  autoPlayInterval?: number;
}

export default function ProgressiveCarousel({
  images,
  autoPlayInterval = 3000,
}: ProgressiveCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerOffset, setContainerOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Auto-play
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, images.length, isHovering]);

  // Calculate visible indices
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + images.length) % images.length;
      indices.push({ index, position: i });
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

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    setIsHovering(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (carouselRef.current) {
      const currentScroll = carouselRef.current.scrollLeft;
      const diff = currentScroll - scrollLeft.current;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          setActiveIndex(
            (current) => (current - 1 + images.length) % images.length
          );
        } else {
          setActiveIndex((current) => (current + 1) % images.length);
        }
      }
    }
    setTimeout(() => setIsHovering(false), 1000);
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setHoveredIndex(null);
    setTimeout(() => setIsHovering(false), 1000);
  };

  return (
    <div className="relative w-full  overflow-hidden">
      <div
        ref={carouselRef}
        className="flex justify-center items-center cursor-grab active:cursor-grabbing h-[90%]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex items-center justify-center"
          style={{
            gap: '1.25rem',
            transform: `translateX(-${containerOffset}px)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {getVisibleIndices().map(({ index, position }) => {
            const absPosition = Math.abs(position);
            const isCenter = position === 0;
            const isHovered = hoveredIndex === index;

            let width = '18.75rem';
            let height = '24.75rem';

            if (absPosition === 1) {
              width = '28.25rem';
              height = '35.25rem';
            }

            if (isCenter) {
              width = isHovered ? '80.25rem' : '31.5rem';
              height = '40.5625rem';
            }

            // Add responsive sizes
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
              // Small screens
              if (isCenter) {
                width = isHovered ? '60rem' : '20rem';
                height = '30rem';
              } else if (absPosition === 1) {
                width = '15rem';
                height = '25rem';
              } else {
                width = '10rem';
                height = '20rem';
              }
            } else if (
              typeof window !== 'undefined' &&
              window.innerWidth <= 1024
            ) {
              // Medium screens
              if (isCenter) {
                width = isHovered ? '70rem' : '25rem';
                height = '35rem';
              } else if (absPosition === 1) {
                width = '20rem';
                height = '30rem';
              } else {
                width = '15rem';
                height = '25rem';
              }
            }

            const opacity =
              absPosition === 0 ? 1 : absPosition === 1 ? 0.7 : 0.4;
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
                  transform: `translateX(${position * 2}rem)`,
                }}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(index);
                    setHoveredIndex(null);
                    setIsHovering(true);
                    setTimeout(() => setIsHovering(false), 1000);
                  }
                }}
              >
                <div
                  className="relative w-full h-full transition-all duration-500 ease-in-out rounded-lg overflow-hidden"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    src={images[index].src}
                    alt={images[index].title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                      isCenter && !isHovered ? 'object-left' : 'object-center'
                    }`}
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
