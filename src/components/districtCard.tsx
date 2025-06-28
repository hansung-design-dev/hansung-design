import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import BannerPeriod from './bannerPeriod';

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  logo: string;
  src: string;
  code: string;
  period?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  } | null;
}

interface DistrictCardProps {
  district: District;
  basePath?: string;
}

export default function DistrictCard({
  district,
  basePath = 'led-display',
}: DistrictCardProps) {
  const isGangbuk = district.code === 'gangbuk';
  const href = isGangbuk
    ? 'https://gangbuk.uriad.com/sub01-01.jsp'
    : `/${basePath}/${encodeURIComponent(district.code)}`;

  const [imageError, setImageError] = useState(false);

  // 기본 로고 이미지 (fallback용)
  const defaultLogo = `/images/district-icon/${
    district.code === 'all' ? 'all.svg' : `${district.code}-gu.png`
  }`;
  const logoUrl = imageError ? defaultLogo : district.logo;

  return (
    <div className="flex items-center justify-center lg:pb-4">
      <Link
        href={href}
        className="w-[25rem] lg:h-[29.5625rem] md:h-[20rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden"
        {...(isGangbuk && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="flex-1 flex flex-col lg:gap-[1rem] md:gap-[2rem] p-6 lg:py-10 ">
          <div className="flex flex-col lg:gap-[2rem] md:gap-[2rem] sm:gap-6">
            <div className="flex gap-[1rem]">
              <Image
                src={logoUrl}
                alt={district.name}
                width={300}
                height={300}
                className="w-[2.375rem] h-[2.375rem] bg-white rounded-md"
                onError={() => setImageError(true)}
              />
              <div className="lg:text-2.5 md:text-1.6 font-700 text-black font-gmarket ">
                {district.name}
              </div>
            </div>
            <div className="flex flex-col sm:gap-6 lg:gap-10 md:gap-6 sm:gap-2">
              <div className="lg:text-1 text-red md:text-0.75">
                마감안내 및 안내내용 <br /> 최종 2줄
              </div>
              <div className="text-gray-14 text-0.875 font-500">
                {district.name === '전체' ? (
                  <div className="sm:pt-0 lg:pt-0 md:pt-0">
                    전체 구의 신청기간을 확인하려면{' '}
                    <br className="sm:inline lg:hidden md:hidden" /> 구별 카드를
                    클릭하세요.
                  </div>
                ) : district.period ? (
                  <BannerPeriod {...district.period} />
                ) : null}
              </div>
            </div>
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
