'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import DistrictCardSkeleton from '@/src/components/skeleton/DistrictCardSkeleton';

interface DistrictCounts {
  [key: string]: number;
}

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

// 구별 기본 정보 (정적 데이터)
const districtInfo: Record<string, Omit<District, 'count'>> = {
  강동구: {
    id: 2,
    name: '강동구',
    code: 'gangdong',
    description: '울림픽대교 남단사거리 앞 외 3건',
    icon: '/images/district-icon/gangdong-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  관악구: {
    id: 3,
    name: '관악구',
    code: 'gwanak',
    description: '서울대입구역 앞 외 3건',
    icon: '/images/district-icon/gwanak-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  마포구: {
    id: 4,
    name: '마포구',
    code: 'mapo',
    description: '홍대입구역 앞 외 5건',
    icon: '/images/district-icon/mapo-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  서대문구: {
    id: 5,
    name: '서대문구',
    code: 'seodaemun',
    description: '울림픽대교 남단사거리 앞 외 3건',
    icon: '/images/district-icon/seodaemun-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  송파구: {
    id: 6,
    name: '송파구',
    code: 'songpa',
    description: '잠실종합운동장 앞 외 5건',
    icon: '/images/district-icon/songpa-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  용산구: {
    id: 7,
    name: '용산구',
    code: 'yongsan',
    description: '여의도공원 앞 외 6건',
    icon: '/images/district-icon/yongsan-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  강북구: {
    id: 8,
    name: '강북구',
    code: 'gangbuk',
    description: '여의도공원 앞 외 6건',
    icon: '/images/district-icon/gangbuk-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  광진구: {
    id: 10,
    name: '광진구',
    code: 'gwangjin',
    description: '서울대입구역 앞 외 3건',
    icon: '/images/district-icon/gwangjin-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  동작구: {
    id: 11,
    name: '동작구',
    code: 'dongjak',
    description: '홍대입구역 앞 외 5건',
    icon: '/images/district-icon/dongjak-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
  동대문구: {
    id: 12,
    name: '동대문구',
    code: 'dongdaemun',
    description: '울림픽대교 남단사거리 앞 외 3건',
    icon: '/images/district-icon/dongdaemun-gu.png',
    size: '1000x1000',
    sizeOfPeople: '10000',
    src: '/images/led/landing.png',
  },
};

export default function BannerDisplayPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistrictCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/banner-display?action=getCounts');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch district counts');
        }

        const counts: DistrictCounts = result.data;
        console.log('🔍 Banner Display: Fetched counts:', counts);

        // 구별 데이터 생성
        const districtData: District[] = [];
        let totalCount = 0;

        // 각 구별로 데이터 생성
        Object.entries(counts).forEach(([districtName, count]) => {
          const districtInfoData = districtInfo[districtName];
          if (districtInfoData) {
            districtData.push({
              ...districtInfoData,
              count,
            });
            totalCount += count;
          }
        });

        // "전체" 카드 추가 (모든 구의 합계)
        districtData.unshift({
          id: 1,
          name: '전체',
          code: 'all',
          description: '모든 구 현수막 게시대',
          count: totalCount,
          icon: '/images/district-icon/all.svg',
          size: '1000x1000',
          sizeOfPeople: '10000',
          src: '/images/led/landing.png',
        });

        setDistricts(districtData);
      } catch (err) {
        console.error('Error fetching banner display counts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictCounts();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
          <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
            현수막게시대
          </h1>
          <p className="text-1.25 font-[500] sm:text-1 text-gray-600">
            지역상권 활성화, 합리적인 광고
          </p>
        </section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Fixed Header - Always visible */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          현수막게시대
        </h1>
        <p className="text-1.25 font-[500] sm:text-1 text-gray-600">
          지역상권 활성화, 합리적인 광고
        </p>
      </section>

      <section className=" mx-auto  mb-12">
        <div className="relative w-full h-[320px] md:h-[400px]  overflow-hidden">
          <Image
            src="/images/banner-display/landing.png"
            alt="현수막게시대 메인 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="flex flex-col items-center justify-center mx-[4rem] px-4 py-8 sm:mx-[0.5rem] md:mx-[2rem]">
        <div className="container grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 lg:gap-4 md:gap-[2rem] sm:gap-[2rem]">
          {loading
            ? // 로딩 중일 때 LED와 동일한 스켈레톤 로더 표시
              [...Array(9)].map((_, index) => (
                <DistrictCardSkeleton key={index} />
              ))
            : // 데이터 로드 완료 시 실제 카드 표시
              districts.map((district) => (
                <DistrictCard
                  key={district.id}
                  district={district}
                  basePath="banner-display"
                />
              ))}
        </div>
      </div>
    </main>
  );
}
