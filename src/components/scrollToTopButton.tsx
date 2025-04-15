// components/ScrollToTopButton.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="absolute fixed bottom-6 right-6 flex flex flex-col gap-[1rem]">
      <Link
        href="/mypage/customer-service"
        className={`rounded-full z-50 transition-opacity duration-300 bg-white shadow-lg p-2 border-none flex items-center justify-center`}
        aria-label="customer service"
      >
        <Image
          src="/svg/headphones.svg"
          alt="customer service"
          className="w-10 h-10 inverted"
          width={40}
          height={40}
        />
      </Link>
      <button
        onClick={scrollToTop}
        className={`z-50 rounded-full transition-opacity duration-300 bg-gray-5 p-2 border-none flex items-center justify-center`}
        aria-label="맨 위로"
      >
        <Image
          src="/svg/tothetop.svg"
          alt="맨 위로"
          className="w-10 h-10 "
          width={40}
          height={40}
        />
      </button>
    </div>
  );
}
