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

  return (
    <div className="lg:h-[20rem] lg:w-[15rem] md:w-[12rem] md:p-0 flex-shrink-0 sm:hidden md:block bg-white rounded-lg lg:p-4">
      <div className="flex flex-col gap-2">
        {tabs.map((tab: { name: string; href: string }) => (
          <div key={tab.name}>
            {tab.name === '로그아웃' ? (
              <button
                onClick={handleLogout}
                className={`px-4 py-4 text-1.25 font-500 lg:border-b-[#E0E0E0] flex items-center justify-between lg:border-b-solid lg:border-b-1 w-full text-left ${
                  activeTab === tab.name ? 'text-black' : 'text-gray-5'
                }`}
              >
                {tab.name}
              </button>
            ) : (
              <Link
                href={tab.href}
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-4 text-1.25 font-500 lg:border-b-[#E0E0E0] flex items-center justify-between lg:border-b-solid lg:border-b-1 ${
                  activeTab === tab.name ? 'text-black' : 'text-gray-5'
                }`}
              >
                {tab.name}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MypageNav;
