import MypageNav from '@/src/components/mypageNav';

export default function MobileMyPage({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { name: string; href: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="pt-[7rem] px-4">
      <div className="text-1.25 font-700 mb-6">사용자님</div>
      <MypageNav
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
