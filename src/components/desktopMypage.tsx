import Image from 'next/image';
import MypageNav from '@/src/components/mypageNav';
import FilterableList from '@/src/components/FilterableList';

interface Props {
  tabs: { name: string; href: string }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const sampleItems = Array(5)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '울림픽대교 남단사거리 앞',
    subtitle: '(남단 유수지앞)',
    location: '방이동',
    status: index < 3 ? '진행중' : '완료',
    date: '2024.03.06',
  }));

const recommendedProducts = Array(4)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: '잠실종합운동장 사거리앞',
    subtitle: '(실내체육관 방향)',
    image: '/images/public-design.jpeg',
    price: 140800,
    tagType: '현수막',
    tagDistrict: '용산구',
  }));

export default function DesktopMyPage({
  tabs,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="items-center flex justify-center bg-[#F1F1F1] ">
      <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px] ">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <MypageNav
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="flex-1 bg-white rounded-lg lg:p-8 md:p-6 w-full overflow-hidden">
            {/* 사용자 정보 */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <h2 className="text-1.5 md:text-2.25 font-semibold">
                  사용자님
                </h2>
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
                      <div className="flex flex-col pl-4 md:pl-6">
                        <div className="lg:text-1 md:text-1.25 font-medium mb-2">
                          {item.label}
                        </div>
                        <div className="lg:text-1.5 md:text-2.25 font-bold">
                          {item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 필터 리스트 */}
            <div className="mb-12">
              <FilterableList items={sampleItems} />
            </div>

            {/* 추천 상품 */}
            <div className="rounded-lg bg-gray-50 p-4 md:p-6">
              <div className="mb-6 flex flex-col items-end lg:px-[1rem] md:px-[2rem]">
                <div className="w-full">
                  <h3 className="text-1.25 md:text-1.5 font-semibold mb-2">
                    추천상품
                  </h3>
                  <div className="border-t border-gray-3 w-full" />
                </div>
                <button className="flex gap-2 text-0.875 text-gray-600 hover:text-black mt-6 mb-10 border-none">
                  <span>더보기</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8"
                    height="14"
                    viewBox="0 0 8 14"
                    fill="none"
                  >
                    <path
                      d="M1 13L7 7L1 1"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <div key={product.id}>
                    <button className="flex flex-col group text-left border-none">
                      <div className="relative aspect-[1/1] w-full overflow-hidden rounded-lg">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <div className="lg:text-0.75 font-400 bg-black text-white rounded-full px-2 py-1 w-[2.5rem] text-center">
                          {product.tagType}
                        </div>
                        <div className="lg:text-0.75 font-400 bg-black text-white rounded-full px-2 py-1 w-[2.5rem] text-center">
                          {product.tagDistrict}
                        </div>
                      </div>
                      <div className="mt-4 text-[#181717] flex flex-col gap-4">
                        <div className="lg:text-1 md:text-1.5 font-400">
                          {product.title} <br />
                          {product.subtitle}
                        </div>

                        <div className="text-right lg:text-2.375 md:text-2.25 lg:font-700 font-pretendard">
                          {product.price.toLocaleString()}
                          <span className="lg:text-1.5 md:text-1.25 font-400">
                            원
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
