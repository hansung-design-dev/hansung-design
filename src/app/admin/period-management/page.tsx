'use client';

import { useState } from 'react';

interface PeriodData {
  id: string;
  region_gu_id: string;
  display_type_id: string;
  period_from: string;
  period_to: string;
  year_month: string;
  period: string;
  region_name?: string;
}

export default function PeriodManagementPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [periods, setPeriods] = useState<PeriodData[]>([]);
  const [selectedYearMonth, setSelectedYearMonth] = useState('2025-08');

  const generateFuturePeriods = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate-future-periods', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ ${result.data.insertedCount}개의 기간 데이터가 생성되었습니다. (${result.data.regions}개 구, ${result.data.years}년)`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ 오류: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ API 호출 오류: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentPeriods = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/check-august-periods');
      const result = await response.json();

      if (result.success) {
        setPeriods(result.data.augustPeriods || []);
        setMessage({
          type: 'success',
          text: `✅ ${result.data.augustPeriods?.length || 0}개의 8월 기간 데이터를 찾았습니다.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ 오류: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ API 호출 오류: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testDisplayPeriod = async (district: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/display-period?district=${encodeURIComponent(district)}&display_type=banner_display`
      );
      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ ${district} 기간 데이터: ${JSON.stringify(result.data, null, 2)}`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `❌ ${district} 오류: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ API 호출 오류: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePeriodsByYearMonth = async () => {
    if (!selectedYearMonth) {
      setMessage({
        type: 'error',
        text: '❌ 년월을 선택해주세요.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/delete-periods-by-yearmonth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ yearMonth: selectedYearMonth }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ ${selectedYearMonth} 기간 데이터 ${result.data.deletedCount}개가 삭제되었습니다.`,
        });
        // 기간 목록 새로고침
        checkCurrentPeriods();
      } else {
        setMessage({
          type: 'error',
          text: `❌ 오류: ${result.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ API 호출 오류: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">기간 데이터 관리</h1>

        {/* 메시지 표시 */}
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm">{message.text}</pre>
          </div>
        )}

        {/* 주요 기능 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">10년치 기간 생성</h3>
            <p className="text-gray-600 mb-4">
              2025년부터 2035년까지 모든 구의 상하반기 기간을 생성합니다.
            </p>
            <button
              onClick={generateFuturePeriods}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '10년치 기간 생성'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">현재 기간 확인</h3>
            <p className="text-gray-600 mb-4">
              8월 기간 데이터를 확인합니다.
            </p>
            <button
              onClick={checkCurrentPeriods}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '확인 중...' : '8월 기간 확인'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">기간 삭제</h3>
            <p className="text-gray-600 mb-4">
              특정 년월의 기간 데이터를 삭제합니다.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                placeholder="2025-08"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={deletePeriodsByYearMonth}
                disabled={loading}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        {/* 테스트 기능 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">기간 API 테스트</h3>
          <div className="flex gap-2 flex-wrap">
            {['관악구', '마포구', '서대문구', '송파구', '용산구'].map((district) => (
              <button
                key={district}
                onClick={() => testDisplayPeriod(district)}
                disabled={loading}
                className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                {district} 테스트
              </button>
            ))}
          </div>
        </div>

        {/* 기간 데이터 표시 */}
        {periods.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">기간 데이터 목록</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">구</th>
                    <th className="px-4 py-2 text-left">년월</th>
                    <th className="px-4 py-2 text-left">기간</th>
                    <th className="px-4 py-2 text-left">시작일</th>
                    <th className="px-4 py-2 text-left">종료일</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => (
                    <tr key={period.id} className="border-b">
                      <td className="px-4 py-2">{period.region_name || period.region_gu_id}</td>
                      <td className="px-4 py-2">{period.year_month}</td>
                      <td className="px-4 py-2">{period.period}</td>
                      <td className="px-4 py-2">{period.period_from}</td>
                      <td className="px-4 py-2">{period.period_to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
