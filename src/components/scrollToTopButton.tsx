'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시/숨김
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed right-20 bottom-100 z-50 w-16 h-16 bg-white rounded-full shadow-lg border-solid border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
      aria-label="맨 위로 이동"
    >
      <Image
        src="/svg/arrow-up.svg"
        alt="맨 위로"
        width={20}
        height={20}
        className="w-8 h-8"
      />
    </button>
  );
}
