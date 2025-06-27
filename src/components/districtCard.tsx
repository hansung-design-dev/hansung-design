import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import BannerPeriod from './bannerPeriod';

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  icon: string;
  size: string;
  sizeOfPeople: string;
  src: string;
  code: string;
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

  // 신청기간 상태
  const [period, setPeriod] = useState<{
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchPeriod() {
      if (!district.name || district.name === '전체') return;
      console.log('[신청기간 fetch] district.name:', district.name);
      const url = `/api/display-period?district=${encodeURIComponent(
        district.name
      )}`;
      console.log('[신청기간 fetch] API URL:', url);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        const result = await res.json();
        console.log('[신청기간 fetch] API result:', result);
        if (!ignore) {
          if (result.success) {
            setPeriod(result.data);
          } else {
            setError(result.error || '신청기간 정보를 불러올 수 없습니다.');
            console.error('[신청기간 fetch] API error:', result.error);
          }
        }
      } catch (err) {
        if (!ignore) setError('신청기간 정보를 불러올 수 없습니다.');
        console.error('[신청기간 fetch] fetch error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchPeriod();
    return () => {
      ignore = true;
    };
  }, [district.name]);

  return (
    <div className="flex items-center justify-center lg:pb-4">
      <Link
        href={href}
        className="w-[25rem] lg:h-[29.5625rem] md:h-[20rem] bg-gray-4 rounded-[1.25rem] flex flex-col overflow-hidden"
        {...(isGangbuk && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="flex-1 flex flex-col lg:gap-[3rem] md:gap-[2rem] p-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-[1rem]">
              <Image
                src={district.icon}
                alt={district.name}
                width={300}
                height={300}
                className="w-[2.375rem] h-[2.375rem] bg-white rounded-md"
              />
              <div className="lg:text-2.5 md:text-1.6 font-700 text-black font-gmarket ">
                {district.name}
              </div>
            </div>
            <div className="lg:text-1 text-red md:text-0.75">
              마감안내 및 안내내용 최종 2줄
            </div>
          </div>
          <div className="text-gray-14 lg:text-1 md:text-0.875 font-500">
            {district.name === '전체' ? (
              <div>전체 구의 신청기간을 확인하려면 구별 카드를 클릭하세요.</div>
            ) : loading ? (
              <div>신청기간 불러오는 중...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : period ? (
              <BannerPeriod {...period} />
            ) : null}
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
