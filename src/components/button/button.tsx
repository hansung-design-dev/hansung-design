import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'outlineGray'
    | 'filledBlack'
    | 'outlinedGray';
  size?: 'sm' | 'md' | 'lg' | 'cart';
  Isborder?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function Button({
  className = '',
  variant = 'default',
  size = 'md',
  Isborder = false,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded transition';
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800',
    outline:
      'w-[7.5rem] py-[0.3125rem] px-[1rem] border border-[#000] text-gray-800 rounded-full border-[0.1q]',
    outlineGray:
      'py-[0.3125rem] px-[1rem] border border-[#B8B8B8] text-[#7D7D7D] rounded-full border-[0.1q]',
    ghost: `rounded-[0.625rem] text-[#7D7D7D] shadow-none ${
      Isborder
        ? 'border-[#B8B8B8] border border-[0.1rem] border-solid'
        : 'border-none'
    }`,
    filledBlack:
      'w-[27rem] h-[4.2rem] rounded-[0.625rem] text-white bg-black font-bold text-1.25',
    outlinedGray:
      'w-[27rem] h-[4.2rem] rounded-[0.625rem] border-solid border-[0.1rem] border-gray-14 text-gray-14 font-bold text-1.25 bg-white',
  };
  const sizes = {
    sm: 'w-[7.5rem] px-3 py-2 text-sm',
    md: 'px-4 py-2 h-[3rem]',
    lg: 'w-[15rem] px-6 h-[3rem] text-1',
    cart: 'w-full md:w-[20rem] sm:w-1/2 h-[4.25rem]  md:h-[3.5rem] sm:text-1 sm:font-weight-700', // cart는 variant에서 크기 지정
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
