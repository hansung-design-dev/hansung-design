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

  return (
    <Link
      href={`/digital-media/${item.id}?tab=${currentTab}`}
      className="bg-white border-solid border-gray-200 border-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity h-full"
    >
      <div className="flex flex-col items-start justify-center w-full h-full">
        <div className="object-cover flex-1 w-full">
          <Image
            src={item.src}
            alt={item.title}
            width={400}
            height={400}
            className="lg:w-full lg:h-full object-cover md:w-[15rem] md:h-[15rem] sm:w-[15rem] sm:h-[15rem] flex items-center justify-center"
          />
        </div>
        <div className="flex flex-col w-full p-4 h-20 flex-shrink-0">
          <div className="text-xl font-bold text-black line-clamp-2">
            {item.title}
          </div>
        </div>
      </div>
    </Link>
  );
}
