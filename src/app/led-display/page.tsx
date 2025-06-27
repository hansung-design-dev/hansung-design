'use client';

import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import DistrictCardSkeleton from '@/src/components/skeleton/DistrictCardSkeleton';
import ledDistricts from '@/src/mock/led-district';
import { useEffect, useState } from 'react';

// API 함수들
async function getLEDDisplayCountsByDistrict() {
  try {
    const response = await fetch('/api/led-display?action=getCounts');
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching LED display counts:', error);
    throw error;
  }
}

async function testSupabaseConnection() {
  try {
    const response = await fetch('/api/test-connection');
    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    throw error;
  }
}

export default function LEDDisplayPage() {
  const [districtCounts, setDistrictCounts] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDistrictCounts() {
      try {
        setIsLoading(true);
        setError(null);

        // 먼저 연결 테스트
        console.log('🔍 Testing connection...');
        const connectionTest = await testSupabaseConnection();
        console.log('🔍 Connection test result:', connectionTest);

        if (!connectionTest.success) {
          throw new Error(`Connection failed: ${connectionTest.error}`);
        }

        console.log('🔍 Fetching LED district counts...');
        const counts = await getLEDDisplayCountsByDistrict();
        console.log('🔍 LED district counts:', counts);
        setDistrictCounts(counts);
      } catch (error) {
        console.error('Error fetching LED district counts:', error);
        setError(
          '데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
        // 에러 발생 시 빈 객체로 설정하여 기본값 사용
        setDistrictCounts({});
      } finally {
        setIsLoading(false);
      }
    }

    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      fetchDistrictCounts();
    }
  }, []);

  // 구별 개수를 업데이트한 districts 배열 생성
  const updatedDistricts = ledDistricts.map((district) => ({
    ...district,
    count:
      district.code === 'all'
        ? Object.values(districtCounts).reduce((sum, count) => sum + count, 0)
        : districtCounts[district.name] || 0,
  }));

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
              <DistrictCard
                key={district.id}
                district={district}
                display_type="led_display"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
