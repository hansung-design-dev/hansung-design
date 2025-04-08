'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const bannerImages = [
  '/images/landing-1.jepg',
  '/images/landing-1.jepg',
  '/images/landing-1.jepg',
];

export default function RollingBanner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[1920px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">MOVE ON THE SCREEN</h1>
        <h2 className="text-2xl">LED 전자게시대</h2>
      </div>
      <div className="relative h-[600px] w-full">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`LED Display ${index + 1}`}
              fill
              className="rounded-[2rem] object-contain"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
