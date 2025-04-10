import Link from 'next/link';
import Image from 'next/image';

const tabs = [
  { name: '주문내역', href: '/mypage/orders' },
  { name: '1:1상담', href: '/mypage/customer-service' },
  { name: '간편정보관리', href: '/mypage/info' },
];

export default function MobileMyPage({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="pt-[7rem] px-4">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Link href="/" className="md:hidden lg:hidden sm:inline">
            <Image
              src="/svg/arrow-left.svg"
              alt="orders"
              width={20}
              height={20}
              className="w-[1.5rem] h-[1.5rem]"
            />
          </Link>
          <div className="text-1.5 font-500">사용자님</div>
          <div className="grid grid-cols-2 gap-4">
            {/* 주문내역 카드 */}
            {[
              { label: '주문내역', count: '3건' },
              { label: '송출중 광고', count: '2건' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center rounded-lg p-4 md:p-6"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full" />
                <div className="flex flex-col pl-4 md:pl-6  ">
                  <div className="text-0.875 font-300 mb-2 text-gray-2">
                    {item.label}
                  </div>
                  <div className="text-1.25 font-900">{item.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-[16rem] flex-shrink-0 ">
        <div className="flex flex-col gap-2">
          {tabs.map((tab: { name: string; href: string }) => (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-3 rounded text-1.25 font-500 border border-[#DDDDDD] border-b-solid flex items-center justify-between md:border-none ${
                activeTab === tab.name ? 'text-black' : 'text-gray-5 '
              }`}
            >
              {tab.name}
              <span className="inline md:hidden pt-4">
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
    </div>
  );
}
