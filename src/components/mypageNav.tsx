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
    <div className="w-[16rem] flex-shrink-0">
      <div className="flex flex-col gap-2">
        {tabs.map((tab: { name: string; href: string }) => (
          <Link
            key={tab.name}
            href={tab.href}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-3 rounded text-sm font-medium ${
              activeTab === tab.name
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
