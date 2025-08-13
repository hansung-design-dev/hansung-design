'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    src: string;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'digital-signage';

  // 미디어경관디자인 탭일 때만 rounded-lg와 간격 조정 적용
  const isMediaDisplayTab = currentTab === 'media-display';

  return (
    <div>
      <Link
        href={`/digital-media/${item.id}?tab=${currentTab}`}
        className={`bg-white border-solid border-gray-200 border-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity w-[23rem] h-full ${
          isMediaDisplayTab ? 'rounded-lg' : ''
        }`}
      >
        <div className="flex flex-col items-start justify-center w-full h-full">
          <div className="object-cover flex-1 w-full flex items-center justify-center">
            <Image
              src={item.src}
              alt={item.title}
              width={1400}
              height={1400}
              className="lg:w-full lg:h-full object-cover md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] flex items-center justify-center"
            />
          </div>
          <div className="text-xl font-bold text-black line-clamp-2 pl-10 py-7">
            {item.title}
          </div>
        </div>
      </Link>
    </div>
  );
}
