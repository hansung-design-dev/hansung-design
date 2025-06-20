'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed sm:hidden lg:bottom-1/4 sm:bottom-1/2 right-6 transform translate-y-1/2 flex flex-col gap-[1rem] z-50">
      <Link
        href="/mypage/customer-service"
        className={`rounded-full transition-opacity duration-300 bg-white shadow-lg p-2 border-none flex items-center justify-center`}
        aria-label="customer service"
      >
        <Image
          src="/svg/headphones.svg"
          alt="customer service"
          className="w-10 h-10 inverted sm:w-8 sm:h-8"
          width={40}
          height={40}
        />
      </Link>
      <button
        onClick={scrollToTop}
        className={`rounded-full transition-opacity duration-300 bg-gray-5 p-2 border-none flex items-center justify-center`}
        aria-label="맨 위로"
      >
        <Image
          src="/svg/tothetop.svg"
          alt="맨 위로"
          className="w-10 h-10 sm:w-8 sm:h-8 "
          width={40}
          height={40}
        />
      </button>
    </div>
  );
}
