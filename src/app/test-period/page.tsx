'use client';

import { useState } from 'react';

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
  const [allDistrictsData, setAllDistrictsData] = useState<Record<string, PeriodData>>({});

  const testDistricts = ['마포구', '서대문구', '송파구', '용산구', '관악구', '강북구'];

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
        setAllDistrictsData(prev => ({
          ...prev,
          [district]: result.data
        }));
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

  const fetchAllDistrictsData = async () => {
    setLoading(true);
    setError(null);
    const newData: Record<string, PeriodData> = {};

    for (const district of testDistricts) {
      try {
        const response = await fetch(
          `/api/display-period?district=${encodeURIComponent(
            district
          )}&display_type=banner_display`
        );
        const result = await response.json();

        if (result.success) {
          newData[district] = result.data;
          console.log(`✅ ${district} 기간 데이터:`, result.data);
        } else {
          console.error(`❌ ${district} 오류:`, result.error);
        }
      } catch (err) {
        console.error(`❌ ${district} API 호출 오류:`, err);
      }
    }

    setAllDistrictsData(newData);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '없음';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">현수막 게시대 신청기간 테스트</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">현재 날짜: {new Date().toLocaleDateString('ko-KR')}</h2>
          <p className="text-gray-600 mb-4">
            오늘은 8월 27일이므로 9월 하반기와 10월 상반기가 표시되어야 합니다.
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={fetchAllDistrictsData}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '로딩 중...' : '모든 구 기간 데이터 가져오기'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 개별 구 테스트 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">개별 구 테스트</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {testDistricts.map((district) => (
              <button
                key={district}
                onClick={() => fetchPeriodData(district)}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded border"
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        {/* 개별 구 결과 */}
        {periodData && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">선택된 구 결과</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">첫 번째 기간 (first_half)</h4>
                <p>시작: {formatDate(periodData.first_half_from)}</p>
                <p>종료: {formatDate(periodData.first_half_to)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">두 번째 기간 (second_half)</h4>
                <p>시작: {formatDate(periodData.second_half_from)}</p>
                <p>종료: {formatDate(periodData.second_half_to)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 모든 구 비교 결과 */}
        {Object.keys(allDistrictsData).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">모든 구 비교 결과</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">구</th>
                    <th className="border border-gray-300 px-4 py-2">첫 번째 기간</th>
                    <th className="border border-gray-300 px-4 py-2">두 번째 기간</th>
                    <th className="border border-gray-300 px-4 py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {testDistricts.map((district) => {
                    const data = allDistrictsData[district];
                    if (!data) return null;

                    const firstPeriod = data.first_half_from && data.first_half_to;
                    const secondPeriod = data.second_half_from && data.second_half_to;
                    
                    // 올바른 기간인지 확인 (9월 하반기와 10월 상반기)
                    const isCorrect = 
                      firstPeriod && 
                      secondPeriod &&
                      data.first_half_from.includes('2025-09-16') &&
                      data.second_half_from.includes('2025-10-01');

                    return (
                      <tr key={district}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {district}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {firstPeriod ? (
                            <>
                              {formatDate(data.first_half_from)} ~ {formatDate(data.first_half_to)}
                            </>
                          ) : (
                            <span className="text-red-500">없음</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {secondPeriod ? (
                            <>
                              {formatDate(data.second_half_from)} ~ {formatDate(data.second_half_to)}
                            </>
                          ) : (
                            <span className="text-red-500">없음</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {isCorrect ? (
                            <span className="text-green-600 font-medium">✅ 정상</span>
                          ) : (
                            <span className="text-red-600 font-medium">❌ 오류</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 기간 설정 규칙 */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">기간 설정 규칙</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">마포구, 강북구 (특별 규칙)</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>상반기: 매월 5일 ~ 19일</li>
                <li>하반기: 매월 20일 ~ 다음달 4일</li>
                <li>게시 시작일 기준 7일 전까지 신청 가능</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">관악구, 서대문구, 송파구, 용산구 (일반 규칙)</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>상반기: 매월 1일 ~ 15일</li>
                <li>하반기: 매월 16일 ~ 말일</li>
                <li>게시 시작일 기준 7일 전까지 신청 가능</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">현재 상황 (8월 27일 기준)</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                <li>9월 하반기와 10월 상반기가 표시되어야 함</li>
                <li>9월 8일부터는 10월 상반기와 10월 하반기가 표시되어야 함</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
