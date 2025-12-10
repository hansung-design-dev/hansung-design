'use client';
import Link from 'next/link';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';

const MypageNav = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { name: string; href: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('로그아웃 실패:', result.error);
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const renderTab = (
    tab: { name: string; href: string },
    className: string
  ) => {
    if (tab.name === '로그아웃') {
      return (
        <button onClick={handleLogout} className={className}>
          {tab.name}
        </button>
      );
    }

    return (
      <Link
        href={tab.href}
        onClick={() => setActiveTab(tab.name)}
        className={className}
      >
        {tab.name}
      </Link>
    );
  };

  const getDesktopTabClass = (tabName: string) =>
    `px-4 py-4 text-1.25 font-500 lg:border-b-[#E0E0E0] flex items-center justify-between lg:border-b-solid lg:border-b-1 w-full text-left ${
      activeTab === tabName ? 'text-black' : 'text-gray-5'
    }`;

  const getMobileTabClass = (tabName: string) =>
    `min-w-[6rem] px-4 py-2 text-center rounded-full text-[0.75rem] font-semibold tracking-tight transition-all duration-200 ease-in-out border flex items-center justify-center ${
      activeTab === tabName
        ? 'bg-black text-white border-black shadow-lg'
        : 'bg-white text-gray-5 border-gray-200 hover:border-black/40 hover:text-black hover:shadow-sm'
    }`;

  return (
    <>
      <div className="w-full md:hidden bg-white rounded-xl py-3 shadow-sm border border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <div key={`mobile-${tab.name}`}>
              {renderTab(tab, getMobileTabClass(tab.name))}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:h-[20rem] lg:w-[15rem] md:w-[12rem] md:p-0 flex-shrink-0 hidden md:block bg-white rounded-lg lg:p-4">
        <div className="flex flex-col gap-2">
          {tabs.map((tab: { name: string; href: string }) => (
            <div key={`desktop-${tab.name}`}>
              {renderTab(tab, getDesktopTabClass(tab.name))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MypageNav;
