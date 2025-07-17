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
  panel_status?: string;
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
  isLEDDisplay?: boolean;
}

export default function DistrictCard({
  district,
  basePath = 'led-display',
  isLEDDisplay = false,
}: DistrictCardProps) {
  const isGangbuk = district.code === 'gangbuk';
  const isMaintenance = district.panel_status === 'maintenance';
  // 기간 데이터를 URL 파라미터로 전달
  const periodParams = district.period
    ? `?period=${encodeURIComponent(JSON.stringify(district.period))}`
    : '';

  const href = isGangbuk
    ? 'https://gangbuk.uriad.com/sub03-01.jsp'
    : `/${basePath}/${encodeURIComponent(district.code)}${periodParams}`;

  const [imageError, setImageError] = useState(false);

  // 디버깅용 로그
  // console.log(`🔍 DistrictCard ${district.name}:`, {
  //   period: district.period,
  //   bankInfo: district.bankInfo,
  //   code: district.code,
  //   isGangbuk,
  //   isLEDDisplay,
  //   panel_status: district.panel_status,
  //   isMaintenance,
  // });

  // 기본 로고 이미지 (fallback용)
  const defaultLogo = `/images/district-icon/${
    district.code === 'all' ? 'all.svg' : `${district.code}-gu.png`
  }`;
  const logoUrl = imageError ? defaultLogo : district.logo;

  // maintenance 상태일 때 카드 내용
  if (isMaintenance) {
    return (
      <div className="flex items-center justify-center lg:pb-4">
        <div className="w-full lg:h-[32rem] md:h-[22rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden opacity-60 cursor-not-allowed">
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
                  현재 준비 중입니다.
                </div>
                <div className="text-gray-14 text-0.875 font-500">
                  <div className="sm:pt-0 lg:pt-0 md:pt-0">
                    서비스 준비 중입니다. <br />
                    조금만 기다려 주세요.
                  </div>
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
        </div>
      </div>
    );
  }

  // 정상 상태일 때 카드 내용
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
              <div className="text-gray-14 text-0.875 font-500">
                <DistrictInfo
                  period={district.period}
                  bankInfo={district.bankInfo}
                  districtName={district.name}
                  flexRow={false}
                  isLEDDisplay={isLEDDisplay}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
