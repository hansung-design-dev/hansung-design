'use client';

import { useState, useEffect } from 'react';
import Nav from '@/src/components/Nav';
import MobileMyPage from '@/src/components/mobileMypage';
import DesktopMyPage from '@/src/components/desktopMypage';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('마이페이지');
  const [isMobile, setIsMobile] = useState(false);

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
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
    <main className="min-h-screen bg-white w-full">
      <Nav variant="default" className="bg-white" />
      {isMobile ? (
        <MobileMyPage activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <DesktopMyPage
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </main>
  );
}
