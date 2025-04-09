import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'outlineGray';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded transition';
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800',
    outline:
      'w-[7.5rem] py-[0.3125rem] px-[1rem] border border-[#000] text-gray-800 rounded-full border-[0.1q]',
    outlineGray:
      'w-[7.5rem] py-[0.3125rem] px-[1rem] border border-[#B8B8B8] text-[#7D7D7D] rounded-full border-[0.1q]',
    ghost:
      'border-[#B8B8B8] rounded-[0.625rem] border border-[0.1rem] border-solid text-[#7D7D7D] shadow-none',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
