import MypageNav from '@/src/components/mypageNav';
import { ReactNode } from 'react';

interface MypageContainerProps {
  tabs: { name: string; href: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

export default function MypageContainer({
  tabs,
  activeTab,
  setActiveTab,
  children,
}: MypageContainerProps) {
  return (
    <div className="flex justify-center sm:bg-white lg:bg-[#F1F1F1]">
      <div className="container w-full lg:max-w-[1200px] md:max-w-[800px] px-4 pt-[7rem] lg:pb-[7rem] md:pb-[3rem]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-4">
          <MypageNav
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="flex-1 bg-white p-4 md:p-8 rounded-lg lg:max-w-full lg:w-full md:max-w-[30rem] h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
