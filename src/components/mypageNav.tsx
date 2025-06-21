import Link from 'next/link';
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
    <div className="lg:h-[15rem] lg:w-[15rem] md:w-[9rem] md:p-0 flex-shrink-0 sm:hidden md:block bg-white rounded-lg lg:p-4">
      <div className="flex flex-col gap-2">
        {tabs.map((tab: { name: string; href: string }) => (
          <Link
            key={tab.name}
            href={tab.href}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-4 text-1.25 font-500  lg:border-b-[#E0E0E0] flex items-center justify-between lg:border-b-solid lg:border-b-1 ${
              activeTab === tab.name ? 'text-black' : 'text-gray-5 '
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
export default MypageNav;
