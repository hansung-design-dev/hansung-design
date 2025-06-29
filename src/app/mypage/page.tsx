'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/authContext';
import Nav from '@/src/components/layouts/nav';
import MobileMyPage from '@/src/components/mobileMypage';
import DesktopMyPage from '@/src/components/desktopMypage';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('마이페이지');
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
    { name: '로그아웃', href: '/' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 767);
      // console.log(window.innerWidth);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="min-h-screen bg-[#F1F1F1] w-full">
      <Nav variant="default" className="bg-white" />
      {isMobile ? (
        <MobileMyPage
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userName={user?.name || ''}
        />
      ) : (
        <DesktopMyPage
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userName={user?.name || ''}
        />
      )}
    </main>
  );
}
