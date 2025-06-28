import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import DistrictInfo from './districtInfo';

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
  bankInfo?: {
    id: string;
    bank_name: string;
    account_number: string;
    depositor: string;
    region_gu: {
      id: string;
      name: string;
    };
    display_types: {
      id: string;
      name: string;
    };
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
        className="w-full lg:h-[32rem] md:h-[22rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden"
        {...(isGangbuk && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="flex-1 flex flex-col lg:gap-[0.75rem] md:gap-[1.5rem] p-6 lg:py-8">
          <div className="flex flex-col lg:gap-[1.5rem] md:gap-[1.5rem] sm:gap-4">
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
            <div className="flex flex-col sm:gap-4 lg:gap-6 md:gap-4 sm:gap-2">
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
                ) : (
                  <DistrictInfo
                    period={district.period}
                    bankInfo={district.bankInfo}
                    flexRow={false}
                  />
                )}
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
