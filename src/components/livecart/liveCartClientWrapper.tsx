'use client';

import LiveCart from './liveCart';
import { usePathname } from 'next/navigation';

export default function LiveCartClientWrapper() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <LiveCart />;
}
