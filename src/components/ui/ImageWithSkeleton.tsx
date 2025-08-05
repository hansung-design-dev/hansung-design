'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
}

export default function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 90,
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로딩 시작
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imageRef}
      className={`relative w-full h-auto min-h-[200px] ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {isVisible && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          className={`w-full h-auto rounded-2xl object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}

      {hasError && (
        <div className="w-full h-[200px] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-gray-500">이미지를 불러올 수 없습니다</div>
        </div>
      )}
    </div>
  );
}
