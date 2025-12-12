'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/contexts/authContext';
import LiveCartClientWrapper from './liveCartClientWrapper';

export default function LiveCartConditional() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 로그인/회원가입/비밀번호 재설정/아이디 찾기 페이지에서는 표시하지 않음
  if (
    pathname.startsWith('/cart') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/find-id') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/payment')
  )
    return null;

  // 유저가 있을 때만 표시
  if (!user) return null;

  return <LiveCartClientWrapper />;
}
