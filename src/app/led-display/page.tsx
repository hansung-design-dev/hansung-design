'use client';

import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import DistrictCardSkeleton from '@/src/components/skeleton/DistrictCardSkeleton';
import ledDistricts from '@/src/mock/led-district';
import { useEffect, useState } from 'react';

interface RegionLogo {
  id: string;
  name: string;
  logo_image_url: string;
}

interface DistrictCounts {
  [key: string]: number;
}

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

export default function LEDDisplayPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedDistricts, setUpdatedDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. 구별 로고 정보 가져오기
        console.log('🔍 Fetching region logos...');
        const logosResponse = await fetch('/api/region-gu?action=getLogos');
        const logosResult = await logosResponse.json();

        if (!logosResult.success) {
          console.warn('Failed to fetch region logos, using default logos');
        }

        const logosMap: Record<string, string> = {};
        if (logosResult.success && logosResult.data) {
          logosResult.data.forEach((region: RegionLogo) => {
            logosMap[region.name] = region.logo_image_url;
          });
        }

        // 2. 구별 카운트 정보 가져오기
        console.log('🔍 Fetching district counts...');
        const countsResponse = await fetch('/api/led-display?action=getCounts');
        const countsResult = await countsResponse.json();

        if (!countsResult.success) {
          throw new Error(
            countsResult.error || 'Failed to fetch district counts'
          );
        }

        const counts: DistrictCounts = countsResult.data;
        console.log('🔍 LED Display: Fetched counts:', counts);

        // 3. 구별 신청기간과 계좌번호 정보 가져오기
        console.log('🔍 Fetching district info...');
        const districtDataPromises = ledDistricts
          .filter((district) => district.code !== 'all')
          .map(async (district) => {
            try {
              // 신청기간 가져오기
              const periodResponse = await fetch(
                `/api/display-period?district=${encodeURIComponent(
                  district.name
                )}&display_type=led_display`
              );
              const periodResult = await periodResponse.json();
              const period = periodResult.success ? periodResult.data : null;

              // 구 정보와 계좌번호 가져오기
              const districtResponse = await fetch(
                `/api/region-gu?action=getByDistrict&district=${encodeURIComponent(
                  district.name
                )}&displayType=led_display`
              );
              const districtResult = await districtResponse.json();
              const bankInfo = districtResult.success
                ? districtResult.data.bank_info
                : null;

              return {
                ...district,
                count: counts[district.name] || 0,
                logo: logosMap[district.name] || district.logo,
                period,
                bankInfo,
              };
            } catch (err) {
              console.warn(`Failed to fetch data for ${district.name}:`, err);
              return {
                ...district,
                count: counts[district.name] || 0,
                logo: logosMap[district.name] || district.logo,
              };
            }
          });

        const districtData = await Promise.all(districtDataPromises);

        // "전체" 카드 추가 (모든 구의 합계)
        const totalCount = Object.values(counts).reduce(
          (sum, count) => sum + count,
          0
        );
        districtData.unshift({
          id: 1,
          name: '전체',
          code: 'all',
          description: '모든 구 LED 게시대',
          count: totalCount,
          logo: '/images/district-icon/all.svg',
          src: '/images/led/landing.png',
        });

        console.log('🔍 All data loaded successfully, setting districts...');
        setUpdatedDistricts(districtData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
          <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
            LED전자게시대
          </h1>
          <p className="text-1.25 font-[500] sm:text-1 text-gray-600">
            디지털 시대의 새로운 광고 매체
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
    <main className="min-h-screen bg-white ">
      {/* Header Section */}
      <section className="lg:container lg:mx-auto lg:px-[8rem] sm:px-[1.5rem] pt-[6rem] pb-[3rem]">
        <h1 className="text-3.75 sm:text-2.5 font-[700] mb-4 font-gmarket">
          LED 전자게시대
        </h1>
        <p className="text-1.25 font-[500] sm:text-1 text-gray-600">
          한 번의 광고, 수천 번의 노출
        </p>
      </section>

      <section className=" mx-auto  mb-12">
        <div className="relative w-full h-[320px] md:h-[400px]  overflow-hidden">
          <Image
            src="/images/led/landing.png"
            alt="공공디자인 메인 이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <div className="flex items-center justify-center mx-[4rem] px-4 py-8 sm:mx-[0.5rem] md:mx-[2rem]">
        {isLoading ? (
          <div className="container grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 lg:gap-4 md:gap-[2rem] sm:gap-[2rem] ">
            {/* 구별 카드 스켈레톤 */}

            {[...Array(6)].map((_, index) => (
              <DistrictCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="container grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 lg:gap-4 md:gap-[2rem] sm:gap-[2rem] ">
            {updatedDistricts.map((district) => (
              <DistrictCard key={district.id} district={district} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
