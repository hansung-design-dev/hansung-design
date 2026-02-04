import { Button } from '@/src/components/button/button';
import type { GroupedCartItem } from '../_types';

type MinimalUser = { username?: string; id?: string } | null;

type Props = {
  open: boolean;
  data: GroupedCartItem | null;
  user: MinimalUser;
  isBankTransferProcessing: boolean;
  onClose: () => void;
  getDisplayTypeLabel: (group: GroupedCartItem) => string;
  logPaymentDebug: (label: string, details?: Record<string, unknown>) => void;
  openBankTransferModal: (group: GroupedCartItem) => void;
  discountedTotalPrice?: number; // 할인 적용된 가격 (관악구 이전 디자인 동일 등)
};

export default function TossPaymentModal({
  open,
  data,
  user,
  isBankTransferProcessing,
  onClose,
  getDisplayTypeLabel,
  logPaymentDebug,
  openBankTransferModal,
  discountedTotalPrice,
}: Props) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">결제</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between font-semibold">
            <span>결제 금액:</span>
            <span>
              {(() => {
                // 테스트용 0원 결제 확인
                const isTestFreePaymentEnabled =
                  process.env.NEXT_PUBLIC_ENABLE_TEST_FREE_PAYMENT === 'true';
                const testFreePaymentUserId =
                  process.env.NEXT_PUBLIC_TEST_FREE_PAYMENT_USER_ID ||
                  'testsung';
                const isTestUser =
                  user?.username === testFreePaymentUserId ||
                  user?.id === testFreePaymentUserId;

                // 할인 적용된 가격 사용 (있으면), 없으면 원래 가격
                const basePrice = discountedTotalPrice ?? data.totalPrice;

                // 디버깅 로그 (기존 동작 유지)
                console.log('🔍 [토스 위젯] 가격 표시 디버깅:', {
                  isTestFreePaymentEnabled,
                  envValue: process.env.NEXT_PUBLIC_ENABLE_TEST_FREE_PAYMENT,
                  testFreePaymentUserId,
                  currentUserUsername: user?.username,
                  currentUserId: user?.id,
                  isTestUser,
                  originalPrice: data.totalPrice,
                  discountedTotalPrice,
                  basePrice,
                  willDisplayZero: isTestFreePaymentEnabled && isTestUser,
                });

                const displayPrice =
                  isTestFreePaymentEnabled && isTestUser ? 0 : basePrice;
                return displayPrice.toLocaleString();
              })()}
              원
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {data.district === '상담신청'
              ? '상담신청'
              : `${data.district} ${getDisplayTypeLabel(data)}`}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <div className="font-medium mb-1">결제할 게시대 목록:</div>
            <div className="space-y-1">
              {data.items.map((item, index) => {
                const itemHalfPeriod = item.halfPeriod || 'first_half';
                const itemYear = item.selectedYear || new Date().getFullYear();
                const itemMonth =
                  item.selectedMonth || new Date().getMonth() + 1;
                const itemPeriodText = `${itemYear}년 ${itemMonth}월 ${
                  itemHalfPeriod === 'first_half' ? '상반기' : '하반기'
                }`;

                return (
                  <div key={item.id} className="text-xs text-gray-600">
                    {index + 1}. 패널번호: {item.panel_code || item.panel_id || '-'}
                    {' / '}이름: {item.name || '-'}
                    {' / '}구: {item.district}
                    {' / '}기간: {itemPeriodText}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 토스 위젯이 렌더링될 영역 */}
        <div className="space-y-4">
          <div id="toss-payment-methods" className="min-h-[100px]">
            {/* 통합결제창 안내 메시지가 여기에 표시됩니다 */}
          </div>

          <div className="mt-4">
            <div className="flex gap-2">
              <div id="toss-payment-button" className="flex-1">
                {/* 결제 버튼이 여기에 동적으로 추가됩니다 */}
              </div>
              <Button
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => {
                  logPaymentDebug('토스 위젯 계좌이체 버튼 클릭', {
                    groupId: data.id,
                    district: data.district,
                    totalPrice: data.totalPrice,
                  });
                  openBankTransferModal(data);
                }}
                disabled={isBankTransferProcessing}
              >
                {isBankTransferProcessing ? '처리중...' : '계좌이체'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


