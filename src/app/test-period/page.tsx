'use client';

import { useState } from 'react';
import BannerPeriod from '@/src/components/bannerPeriod';

interface PeriodData {
  first_half_from: string;
  first_half_to: string;
  second_half_from: string;
  second_half_to: string;
}

export default function TestPeriodPage() {
  const [periodData, setPeriodData] = useState<PeriodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDistricts = ['마포구', '서대문구', '송파구', '용산구', '관악구'];

  const fetchPeriodData = async (district: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/display-period?district=${encodeURIComponent(
          district
        )}&display_type=banner_display`
      );
      const result = await response.json();

      if (result.success) {
        setPeriodData(result.data);
        console.log(`✅ ${district} 기간 데이터:`, result.data);
      } else {
        setError(result.error || '데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError(`API 호출 오류: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">기간 데이터 테스트</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">테스트할 구 선택:</h2>
        <div className="flex gap-2 flex-wrap">
          {testDistricts.map((district) => (
            <button
              key={district}
              onClick={() => fetchPeriodData(district)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-blue-600">로딩 중...</div>}

      {error && <div className="text-red-600 mb-4">오류: {error}</div>}

      {periodData && (
        <div className="border p-4 rounded">
          <h3 className="text-lg font-semibold mb-3">기간 데이터 결과:</h3>
          <div className="mb-4">
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(periodData, null, 2)}
            </pre>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">
              BannerPeriod 컴포넌트 렌더링:
            </h4>
            <BannerPeriod {...periodData} />
          </div>
        </div>
      )}
    </div>
  );
}
