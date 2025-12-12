import { Button } from '@/src/components/button/button';
import type { BankAccountInfo, GroupedCartItem } from '../_types';

type Props = {
  open: boolean;
  group: GroupedCartItem | null;
  loading: boolean;
  error: string | null;
  accountInfo: BankAccountInfo | null;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: (group: GroupedCartItem, accountInfo: BankAccountInfo) => void;
  getDisplayTypeLabel: (group: GroupedCartItem) => string;
};

export default function BankTransferModal({
  open,
  group,
  loading,
  error,
  accountInfo,
  isProcessing,
  onClose,
  onConfirm,
  getDisplayTypeLabel,
}: Props) {
  if (!open || !group) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">계좌이체 안내</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {group.district} ({getDisplayTypeLabel(group)})
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {group.name} · 총 금액 {group.totalPrice.toLocaleString()}원
        </p>
        {loading ? (
          <p className="text-sm text-gray-500 mb-4">
            계좌 정보를 불러오는 중입니다...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        ) : accountInfo ? (
          <div className="space-y-2 mb-4">
            <div className="text-sm text-gray-600">
              프로젝트명:{' '}
              <span className="font-medium text-gray-800">{group.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              연락처:{' '}
              <span className="font-medium text-gray-800">
                {group.contact_person_name || '연락처 없음'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              은행명:{' '}
              <span className="font-medium text-gray-800">
                {accountInfo.bankName}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              계좌번호:{' '}
              <span className="font-medium text-gray-800">
                {accountInfo.accountNumber}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              예금주:{' '}
              <span className="font-medium text-gray-800">
                {accountInfo.owner}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              입금 확인 후 주문이 자동으로 결제완료 처리됩니다.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            계좌정보를 불러오지 못했습니다.
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            onClick={onClose}
          >
            닫기
          </Button>
          <Button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            disabled={!accountInfo || loading || isProcessing}
            onClick={() => {
              if (accountInfo) onConfirm(group, accountInfo);
            }}
          >
            <span className="relative inline-flex items-center justify-center">
              <span className={isProcessing ? 'invisible' : 'visible'}>
                입금정보 확인 후 주문
              </span>
              {isProcessing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  처리중...
                </span>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}


