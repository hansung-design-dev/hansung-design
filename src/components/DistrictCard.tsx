import Link from 'next/link';
import Image from 'next/image';

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  icon: string;
  size: string;
  sizeOfPeople: string;
  src: string;
}

interface DistrictCardProps {
  district: District;
  basePath?: string;
}

export default function DistrictCard({
  district,
  basePath = 'led-display',
}: DistrictCardProps) {
  return (
    <div className="flex items-center justify-center">
      <Link
        href={`/${basePath}/${encodeURIComponent(district.name)}`}
        className="w-[25rem] h-[29.5625rem] md:h-[25rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden "
      >
        <div className="flex-1 flex flex-col gap-[3rem] p-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-[1rem]">
              <Image
                src={district.icon}
                alt={district.name}
                width={10}
                height={10}
                className="w-[2.375rem] h-[2.375rem]"
              />
              <div className="text-2.5 font-700 text-black font-gmarket ">
                {district.name}
              </div>
            </div>
            <div className="text-1 text-red">마감안내 및 안내내용 최종 2줄</div>
          </div>
          <div className="text-gray-14 text-1 font-500">
            <div>송출사이즈 {district.size}</div>
            <div>유동인구: {district.sizeOfPeople}</div>
            <div>소비자트렌드: </div>
          </div>
        </div>
        <div className="relative w-full h-[12rem]">
          <Image
            src={district.src}
            alt={district.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
    </div>
  );
}
