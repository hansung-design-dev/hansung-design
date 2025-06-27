import { InputHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-black',
        className
      )}
      {...props}
    />
  );
}
