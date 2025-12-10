import React, { useState } from 'react';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';
import { useRouter } from 'next/navigation';
import { Button } from './button/button';
import ConfirmModal from './modal/ConfirmModal';

// 알림 모달 컴포넌트
function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  onConfirm?: () => void;
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="text-green-500 text-4xl mb-4">✓</div>;
      case 'error':
        return <div className="text-red-500 text-4xl mb-4">✗</div>;
      case 'warning':
        return <div className="text-yellow-500 text-4xl mb-4">⚠</div>;
      default:
        return <div className="text-blue-500 text-4xl mb-4">ℹ</div>;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {getIcon()}
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button
            size="md"
            variant="filledBlack"
            onClick={handleConfirm}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ListItem {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  productType?: string;
  status: string; // 마감여부
  paymentStatus?: string; // 결제여부
  quantity?: number;
  orderId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order?: any; // 전체 주문 정보
  orderDetailId?: string;
  requiresManualPayment?: boolean;
}

const statusColorMap: Record<string, string> = {
  추가결제: 'text-[#D61919]',
  파일오류: 'text-[#D61919]',
  송출중: 'text-[#109251]',
  진행중: 'text-[#109251]',
  마감: 'text-[#7D7D7D]',
};

const getStatusClass = (status: string) => {
  return statusColorMap[status] || 'text-black';
};

interface ItemTableProps {
  items: ListItem[];
  showHeader?: boolean;
  showCheckbox?: boolean;
  onItemSelect?: (id: number, checked: boolean) => void;
  selectedIds?: number[];
  enableRowClick?: boolean;
  expandedItemId?: number | null;
  onExpandItem?: (itemId: number | null) => void;
  expandedContent?: React.ReactNode;
  onCancelOrder?: (item: ListItem) => void;
  onPaymentClick?: (item: ListItem) => void; // 결제하기 콜백
}

const ITEMS_PER_PAGE = 10;

const OrderItemList: React.FC<ItemTableProps> = ({
  items,
  showHeader = true,
  showCheckbox = false,
  onItemSelect,
  selectedIds = [],
  enableRowClick = true,
  expandedItemId,
  onExpandItem,
  expandedContent,
  onCancelOrder,
  onPaymentClick,
}) => {
  const [page, setPage] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<ListItem | null>(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'warning',
    onConfirm: () => {},
  });
  const router = useRouter();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleItemClick = (itemId: number, orderId?: string) => {
    if (onItemSelect) {
      const isSelected = selectedIds.includes(itemId);
      onItemSelect(itemId, !isSelected);
    } else {
      if (orderId) {
        router.push(`/mypage/orders/${orderId}`);
      } else {
        router.push(`/mypage/orders/${itemId}`);
      }
    }
  };

  const handleRowClick = (
    e: React.MouseEvent,
    itemId: number,
    orderId?: string
  ) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // 확장 기능이 있으면 확장 처리
    if (onExpandItem) {
      if (expandedItemId === itemId) {
        onExpandItem(null); // 이미 확장된 아이템이면 닫기
      } else {
        onExpandItem(itemId); // 새로운 아이템 확장
      }
    } else {
      handleItemClick(itemId, orderId);
    }
  };

  const handleCancelClick = (item: ListItem) => {
    if (onCancelOrder) {
      onCancelOrder(item);
    } else {
      setItemToCancel(item);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmCancel = async () => {
    if (itemToCancel) {
      try {
        const orderNumber =
          itemToCancel.order?.order_number ||
          itemToCancel.orderId ||
          itemToCancel.id.toString();

        const response = await fetch(`/api/orders/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderNumber }),
        });

        const result = await response.json();

        if (result.success) {
          // 성공 시 UI에서 아이템 제거
          onCancelOrder?.(itemToCancel);

          // 성공 모달 표시
          setAlertModal({
            isOpen: true,
            title: '삭제 완료',
            message: '주문이 성공적으로 취소되었습니다.',
            type: 'success',
            onConfirm: () => {},
          });
        } else {
          // 에러 처리
          setAlertModal({
            isOpen: true,
            title: '삭제 실패',
            message: result.error || '주문 취소에 실패했습니다.',
            type: 'error',
            onConfirm: () => {},
          });
        }
      } catch (error) {
        console.error('주문 취소 에러:', error);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '주문 취소 중 오류가 발생했습니다.',
          type: 'error',
          onConfirm: () => {},
        });
      }
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="신청 취소 확인"
        message="정말로 이 신청을 취소하시겠습니까?"
        confirmText="취소하기"
        cancelText="돌아가기"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />

      {/* 주문내역이 없을 때 */}
      {items.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-1.25">
          주문내역이 없습니다
        </div>
      )}

      {/* 주문내역이 있을 때만 테이블/카드 표시 */}
      {items.length > 0 && (
        <>
          {/* ✅ 데스크탑/tablet 이상: table로 표시 */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full table-fixed border-collapse border-t border-gray-200 text-1.25 font-500">
              <colgroup>
                {showCheckbox && <col className="w-[3.5rem]" />}
                <col className="w-[7%]" />
                <col className="w-[45%] xl:w-[40%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
              </colgroup>
              {showHeader && (
                <thead>
                  <tr className="border-b-solid border-b-1 border-gray-300 h-[3rem] text-gray-2 text-1.25">
                    {showCheckbox && <th className="text-center">선택</th>}
                    <th className="text-center">No</th>
                    <th className="text-left pl-10">게시대 명</th>
                    <th className="text-center">행정구</th>
                    <th className="text-center">상품유형</th>
                    <th className="text-center">마감여부</th>
                    <th className="text-center">결제여부</th>
                    <th className="text-center">&nbsp;</th>
                  </tr>
                </thead>
              )}
              <tbody>
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b-solid border-b-1 border-gray-200 h-[3.5rem] hover:bg-gray-50 ${
                      enableRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={(e) => handleRowClick(e, item.id, item.orderId)}
                  >
                    {showCheckbox && (
                      <td
                        className="text-center px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) =>
                            onItemSelect?.(item.id, e.target.checked)
                          }
                        />
                      </td>
                    )}
                    <td className="text-center text-1.125 font-500">
                      {item.id}
                    </td>
                    <td className="text-left pl-10 text-1.125 font-500 lg:whitespace-normal">
                      <span className="font-medium text-black">
                        {item.title?.replace(/^\s*\d+\.\s*/, '')}
                        <br className="line-height-1" />
                        {item.subtitle && (
                          <span className="ml-1 text-gray-500 text-0.875">
                            파일제목: {item.subtitle}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="text-center text-1.125 font-500">
                      {item.location}
                    </td>
                    <td className="text-center text-1.125 font-500">
                      {item.productType}
                    </td>
                    <td
                      className={`text-center font-semibold text-1.125 font-500 ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </td>
                    <td className="text-center text-1.125 font-500">
                      {item.paymentStatus || '-'}
                    </td>
                    <td className="text-center">
                      <Button
                        size="xs"
                        variant="outlinedGray"
                        className={` px-4 py-1 rounded-full text-gray-700 font-200`}
                        // 테스트 중이므로 모든 상태에서 취소 가능
                        // TODO: 실제 운영 시에는 아래 주석을 해제
                        // disabled={
                        //   item.status === '마감' || item.status === '송출중'
                        // }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelClick(item);
                        }}
                      >
                        신청 취소
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* 확장된 상세 정보 표시 */}
                {expandedItemId && expandedContent && (
                  <tr>
                    <td colSpan={showCheckbox ? 8 : 7} className="p-0">
                      <div>{expandedContent}</div>
                    </td>
                  </tr>
                )}

                {/* 빈 row로 높이 맞추기 */}
                {Array.from({
                  length: ITEMS_PER_PAGE - paginatedItems.length,
                }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-[3.5rem]">
                    <td colSpan={showCheckbox ? 8 : 7} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ 모바일(sm, md): 카드형으로 표시 */}
          <div className="flex flex-col gap-4 lg:hidden items-center ">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`border-solid border-gray-200 rounded-lg p-12 flex flex-col gap-2 shadow-sm hover:bg-gray-50 ${
                  enableRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (enableRowClick) {
                    // 확장 기능이 있으면 확장 처리
                    if (onExpandItem) {
                      if (expandedItemId === item.id) {
                        onExpandItem(null); // 이미 확장된 아이템이면 닫기
                      } else {
                        onExpandItem(item.id); // 새로운 아이템 확장
                      }
                    } else {
                      handleItemClick(item.id, item.orderId);
                    }
                  }
                }}
              >
                <div className="font-medium text-black text-1.25 font-500">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-gray-500">{item.subtitle}</div>
                )}
                <div className="text-1.25 font-500">
                  행정동: {item.location}
                </div>
                <div className="text-1.25 font-500">
                  상품유형: {item.productType}
                </div>
                <div className="text-1.25 font-500">
                  마감여부:&nbsp;
                  <span
                    className={`text-1.25 font-500 ${getStatusClass(
                      item.status
                    )} font-medium`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-1.25 font-500">
                  결제여부: {item.paymentStatus || '-'}
                </div>
                <div className="flex gap-2 mt-2">
                  {item.paymentStatus === '대기' &&
                    item.requiresManualPayment &&
                    onPaymentClick && (
                      <button
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPaymentClick(item);
                        }}
                      >
                        결제하기
                      </button>
                    )}
                  <button
                    className={`border px-4 py-1 rounded text-black border-black hover:bg-gray-100 text-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelClick(item);
                    }}
                  >
                    신청 취소
                  </button>
                </div>

                {/* 모바일에서 확장된 상세 정보 표시 */}
                {expandedItemId === item.id && expandedContent && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border-t border-gray-200">
                    {expandedContent}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* 페이지네이션 UI */}
          <div className="flex justify-center items-center gap-1 mt-4 pb-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-gray-14" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-7 h-7 flex items-center justify-center text-1.25 font-500 rounded ${
                  page === num ? 'text-black' : 'text-gray-14'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-gray-14" />
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default OrderItemList;
