'use client';

import Image from 'next/image';

interface BackToListButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconWidth?: number;
  iconHeight?: number;
}

export default function BackToListButton({
  onClick,
  label = '목록으로 가기',
  className,
  iconClassName = 'w-13 h-13',
  textClassName,
  iconWidth = 200,
  iconHeight = 200,
}: BackToListButtonProps) {
  const buttonClassNames = [
    'flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors',
    'lg:text-1.9 md:text-1.75 font-500 mb-4 px-3 py-1 hover:bg-gray-100 rounded-md',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spanClassNames = ['text-lg', textClassName].filter(Boolean).join(' ');

  return (
    <button onClick={onClick} className={buttonClassNames}>
      <Image
        src="/svg/arrow-left.svg"
        alt="뒤로 가기"
        width={iconWidth}
        height={iconHeight}
        className={iconClassName}
      />
      <span className={spanClassNames}>{label}</span>
    </button>
  );
}
