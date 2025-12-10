import MypageNav from '@/src/components/mypageNav';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface MypageContainerProps {
  activeTab: string;
  children: ReactNode;
}

// 전역 마이페이지 탭 정의
export const mypageTabs = [
  { name: '주문내역', href: '/mypage/orders' },
  { name: '시안관리', href: '/mypage/design' },
  { name: '1:1상담', href: '/mypage/customer-service' },
  { name: '간편정보관리', href: '/mypage/info' },
  { name: '로그아웃', href: '/' },
];

export default function MypageContainer({
  activeTab,
  children,
}: MypageContainerProps) {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === '로그아웃') {
      // 로그아웃 처리
      router.push('/');
    } else {
      // 해당 페이지로 이동
      const targetTab = mypageTabs.find((t) => t.name === tab);
      if (targetTab) {
        router.push(targetTab.href);
      }
    }
  };

  return (
    <div className="flex justify-center items-center sm:bg-white lg:bg-[#F1F1F1]">
      <div className=" w-full lg:max-w-[1400px] md:max-w-[1000px] pt-[7rem] lg:pb-[7rem] md:pb-[3rem]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-4">
          <MypageNav
            tabs={mypageTabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
          <div className="flex-1 bg-white p-4 md:p-8 rounded-lg lg:max-w-full lg:w-full md:max-w-[40rem] lg:max-w-[55rem] xl:max-w-[65rem] 2xl:max-w-[75rem] h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
