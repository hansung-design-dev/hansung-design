'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DistrictCard from '@/src/components/districtCard';
import DistrictCardSkeleton from '@/src/components/skeleton/DistrictCardSkeleton';

interface DistrictCounts {
  [key: string]: number;
}

interface RegionLogo {
  id: string;
  name: string;
  logo_image_url: string;
}

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
}

export default function BannerDisplayPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 데이터를 한번에 로딩
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
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
        const countsResponse = await fetch(
          '/api/banner-display?action=getCounts'
        );
        const countsResult = await countsResponse.json();

        if (!countsResult.success) {
          throw new Error(
            countsResult.error || 'Failed to fetch district counts'
          );
        }

        const counts: DistrictCounts = countsResult.data;
        console.log('🔍 Banner Display: Fetched counts:', counts);

        // 3. 구별 신청기간과 계좌번호 정보 가져오기
        console.log('🔍 Fetching district info...');

        // 강북구는 데이터가 없어도 카드로 표시해야 하므로 별도 처리
        const allDistricts = [...Object.keys(counts)];
        if (!allDistricts.includes('강북구')) {
          allDistricts.push('강북구');
        }

        const districtDataPromises = allDistricts.map(async (districtName) => {
          try {
            // 신청기간 가져오기 (강북구는 기본값 사용)
            let period = null;
            if (districtName !== '강북구') {
              console.log(`🔍 Fetching period for ${districtName}...`);
              const periodResponse = await fetch(
                `/api/display-period?district=${encodeURIComponent(
                  districtName
                )}&display_type=banner_display`
              );
              const periodResult = await periodResponse.json();
              console.log(
                `🔍 Period result for ${districtName}:`,
                periodResult
              );
              period = periodResult.success ? periodResult.data : null;
            }

            // 구 정보와 계좌번호 가져오기
            // 구 정보와 계좌번호 가져오기
            const districtResponse = await fetch(
              `/api/region-gu?action=getByDistrict&district=${encodeURIComponent(
                districtName
              )}&displayType=banner_display`
            );
            const districtResult = await districtResponse.json();

            // 강북구는 데이터가 없어도 카드로 표시
            if (!districtResult.success && districtName !== '강북구') {
              throw new Error(
                `Failed to fetch district data for ${districtName}`
              );
            }

            // 강북구의 경우 기본 정보로 카드 생성
            if (districtName === '강북구' && !districtResult.success) {
              return {
                id: 8,
                name: '강북구',
                code: 'gangbuk',
                description: '강북구 현수막게시대',
                count: 0,
                logo: '/images/district-icon/gangbuk-gu.png',
                src: '/images/led/landing.png',
                is_for_admin: false,
                period: null,
                bankInfo: null,
              };
            }

            const districtData = districtResult.data;
            const bankInfo = districtData.bank_info;

            return {
              id: parseInt(
                districtData.id.replace(/-/g, '').substring(0, 8),
                16
              ), // UUID를 숫자로 변환
              name: districtName,
              code: districtData.code,
              description: `${districtName} 현수막게시대`,
              count: counts[districtName] || 0,
              logo:
                logosMap[districtName] ||
                `/images/district-icon/${districtData.code}-gu.png`,
              src: '/images/led/landing.png',
              is_for_admin: districtName === '서대문구', // 서대문구만 행정용
              period,
              bankInfo,
            };
          } catch (err) {
            console.warn(`Failed to fetch data for ${districtName}:`, err);
            return null;
          }
        });

        const districtData = (await Promise.all(districtDataPromises)).filter(
          Boolean
        ) as District[];

        // 구별 가나다순 정렬
        districtData.sort((a, b) => a.name.localeCompare(b.name));

        // "전체" 카드 추가 (모든 구의 합계)
        const totalCount = Object.values(counts).reduce(
          (sum, count) => sum + count,
          0
        );
        districtData.unshift({
          id: 1,
          name: '전체',
          code: 'all',
          description: '모든 구 현수막 게시대',
          count: totalCount,
          logo: '/images/district-icon/all.svg',
          src: '/images/led/landing.png',
        });

        console.log('🔍 All data loaded successfully, setting districts...');
        console.log('🔍 Final districts data:', districtData);
        setDistricts(districtData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
                />
              ))}
        </div>
      </div>
    </main>
  );
}
