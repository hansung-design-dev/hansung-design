'use client';
import { usePathname } from 'next/navigation';
import LiveCartClientWrapper from './liveCartClientWrapper';

export default function LiveCartConditional() {
  const pathname = usePathname();
  if (
    pathname.startsWith('/cart') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/payment')
  )
    return null;
  return <LiveCartClientWrapper />;
}
