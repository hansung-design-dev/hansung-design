'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import DistrictCardSkeleton from '@/src/components/skeleton/DistrictCardSkeleton';

// Removed unused interfaces

interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  logo: string;
  src: string;
  code: string;
  is_for_admin?: boolean; // 행정용 구분
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
  panel_status?: string;
}

export default function BannerDisplayPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 최적화된 데이터 로딩 - 하나의 API로 모든 데이터 가져오기
  useEffect(() => {
    const fetchOptimizedData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching optimized banner display data...');

        // 통합 API 호출 - 모든 데이터를 한번에 가져오기
        const response = await fetch(
          '/api/banner-display?action=getAllDistrictsData'
        );
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch district data');
        }

        const data = result.data;
        console.log('🔍 Optimized data received:', data);

        // 데이터 변환 및 처리
        const processedDistricts: District[] = data.districts.map(
          (district: {
            id: string;
            name: string;
            code: string;
            logo_image_url?: string;
            panel_status?: string;
            period?: {
              first_half_from: string;
              first_half_to: string;
              second_half_from: string;
              second_half_to: string;
            } | null;
            bank_info?: {
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
          }) => {
            // panel_status가 maintenance인지 확인
            const isMaintenance = district.panel_status === 'maintenance';

            return {
              id: parseInt(district.id.replace(/-/g, '').substring(0, 8), 16),
              name: district.name,
              code: district.code,
              description: isMaintenance
                ? `${district.name} 현수막게시대 (준비 중)`
                : `${district.name} 현수막게시대`,
              count:
                (data.counts as Record<string, number>)[district.name] || 0,
              logo:
                district.logo_image_url ||
                `/images/district-icon/${district.code}-gu.png`,
              src: '/images/banner-display/landing.png',
              panel_status: district.panel_status,
              period: district.period || null,
              bankInfo: district.bank_info || null,
            };
          }
        );

        // 구별 가나다순 정렬
        processedDistricts.sort((a, b) => a.name.localeCompare(b.name));

        console.log('🔍 Final processed districts:', processedDistricts);
        setDistricts(processedDistricts);
      } catch (err) {
        console.error('Error fetching optimized data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchOptimizedData();
  }, []); // 한 번만 실행

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
                  isLEDDisplay={false}
                />
              ))}
        </div>
      </div>
    </main>
  );
}
