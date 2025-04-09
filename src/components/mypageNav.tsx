import Link from 'next/link';
import Image from 'next/image';
const MypageNav = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { name: string; href: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div className="lg:w-[16rem] flex-shrink-0 sm:w-full">
      <div className="flex flex-col gap-2">
        {tabs.map((tab: { name: string; href: string }) => (
          <Link
            key={tab.name}
            href={tab.href}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-3 rounded text-1.25 font-500 sm:border-[#DDDDDD] sm:border-b-solid sm:flex sm:items-center sm:justify-between lg:border-none ${
              activeTab === tab.name ? 'text-black' : 'text-gray-5 '
            }`}
          >
            {tab.name}
            <span className="sm:inline lg:hidden sm:pt-4">
              <Image
                src="/svg/arrow-right.svg"
                width={20}
                height={20}
                alt="arrow"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default MypageNav;
