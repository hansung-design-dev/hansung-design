'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/button/button';

interface PanelInfo {
  id: string;
  nickname: string;
  address: string;
  district: string;
}

// Removed unused interfaces

interface InventoryStatus {
  panel_info_id: string;
  panel_name: string;
  district: string;
  year_month: string;
  half_period: string;
  period_from: string;
  period_to: string;
  total_slots: number;
  available_slots: number;
  closed_slots: number;
  inventory_status: string;
}

export default function TestHalfPeriodInventory() {
  const [panels, setPanels] = useState<PanelInfo[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string>('');
  const [displayStartDate, setDisplayStartDate] = useState<string>('');
  const [displayEndDate, setDisplayEndDate] = useState<string>('');
  const [slotOrderQuantity, setSlotOrderQuantity] = useState<number>(1);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);

  // 패널 목록 로드
  useEffect(() => {
    loadPanels();
  }, []);

  const loadPanels = async () => {
    try {
      const response = await fetch(
        '/api/region-gu?display_type=banner_display'
      );
      const data = await response.json();
      if (data.success) {
        setPanels(data.data);
      }
    } catch (error) {
      console.error('패널 로드 실패:', error);
    }
  };

  const runTest = async (action: string) => {
    if (!selectedPanel || !displayStartDate || !displayEndDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-half-period-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          panel_info_id: selectedPanel,
          display_start_date: displayStartDate,
          display_end_date: displayEndDate,
          slot_order_quantity: slotOrderQuantity,
        }),
      });

      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      console.error('테스트 실행 실패:', error);
      setTestResults({
        success: false,
        message: '테스트 실행 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryStatus = async () => {
    if (!selectedPanel) return;

    try {
      const response = await fetch(
        `/api/test-half-period-inventory?panel_info_id=${selectedPanel}`
      );
      const data = await response.json();
      if (data.success) {
        setInventoryStatus(data.data);
      }
    } catch (error) {
      console.error('재고 현황 로드 실패:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '매진':
        return 'text-red-600 font-bold';
      case '재고부족':
        return 'text-orange-600 font-semibold';
      case '재고있음':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🧪 상하반기 재고관리 플로우 테스트
      </h1>

      {/* 테스트 설정 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">테스트 설정</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">패널 선택</label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">패널을 선택하세요</option>
              {panels.map((panel) => (
                <option key={panel.id} value={panel.id}>
                  {panel.nickname} ({panel.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              게시 시작일
            </label>
            <input
              type="date"
              value={displayStartDate}
              onChange={(e) => setDisplayStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              게시 종료일
            </label>
            <input
              type="date"
              value={displayEndDate}
              onChange={(e) => setDisplayEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">주문 수량</label>
            <input
              type="number"
              min="1"
              value={slotOrderQuantity}
              onChange={(e) => setSlotOrderQuantity(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => runTest('check_period')}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            📅 상하반기 기간 확인
          </Button>

          <Button
            onClick={() => runTest('check_inventory')}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600"
          >
            📊 재고 현황 확인
          </Button>

          <Button
            onClick={() => runTest('simulate_order')}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            🛒 주문 시뮬레이션
          </Button>

          <Button
            onClick={() => runTest('view_inventory_status')}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            📋 상하반기 재고 현황
          </Button>

          <Button
            onClick={() => runTest('view_inventory_summary')}
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            📈 재고 통계
          </Button>

          <Button
            onClick={() => runTest('debug_orders')}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            🐛 디버깅 정보
          </Button>
        </div>
      </div>

      {/* 테스트 결과 */}
      {testResults && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            테스트 결과
            <span
              className={`ml-2 text-sm ${
                testResults.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {testResults.success ? '✅ 성공' : '❌ 실패'}
            </span>
          </h2>

          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium mb-2">{testResults.message}</p>
            {testResults.data && (
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(testResults.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* 상하반기 재고 현황 */}
      {selectedPanel && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">상하반기 재고 현황</h2>
            <Button
              onClick={loadInventoryStatus}
              className="bg-blue-500 hover:bg-blue-600"
            >
              🔄 새로고침
            </Button>
          </div>

          {inventoryStatus.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">구</th>
                    <th className="px-4 py-2 text-left">연월</th>
                    <th className="px-4 py-2 text-left">상하반기</th>
                    <th className="px-4 py-2 text-left">기간</th>
                    <th className="px-4 py-2 text-center">총 슬롯</th>
                    <th className="px-4 py-2 text-center">가용 슬롯</th>
                    <th className="px-4 py-2 text-center">사용 슬롯</th>
                    <th className="px-4 py-2 text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryStatus.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{item.district}</td>
                      <td className="px-4 py-2">{item.year_month}</td>
                      <td className="px-4 py-2 font-medium">
                        {item.half_period === 'first_half'
                          ? '상반기'
                          : item.half_period === 'second_half'
                          ? '하반기'
                          : '전체월'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {item.period_from} ~ {item.period_to}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.total_slots}
                      </td>
                      <td className="px-4 py-2 text-center font-medium">
                        {item.available_slots}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.closed_slots}
                      </td>
                      <td
                        className={`px-4 py-2 text-center ${getStatusColor(
                          item.inventory_status
                        )}`}
                      >
                        {item.inventory_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              재고 현황을 불러오려면 새로고침 버튼을 클릭하세요.
            </p>
          )}
        </div>
      )}

      {/* 플로우 설명 */}
      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">
          🔄 상하반기 재고관리 플로우
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>1. 기간 설정:</strong> 현수막게시대는 상반기(1-15일),
            하반기(16-31일)로 구분
          </p>
          <p>
            <strong>2. 재고 생성:</strong> 기간 생성 시 상하반기별로 독립적인
            재고 생성
          </p>
          <p>
            <strong>3. 주문 처리:</strong> display_start_date로 해당하는
            상하반기 기간을 찾아 재고 감소
          </p>
          <p>
            <strong>4. 재고 관리:</strong> 상하반기별로 독립적인 재고 관리
            (상반기 주문이 하반기 재고에 영향 없음)
          </p>
          <p>
            <strong>5. 재고 복구:</strong> 주문 취소 시 해당 상하반기의 재고만
            복구
          </p>
        </div>
      </div>
    </div>
  );
}
