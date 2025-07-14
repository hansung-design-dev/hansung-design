import React from 'react';

interface OrderDetail {
  order_number?: string;
  project_name?: string;
  user_profile?: {
    profile_title?: string;
    company_name?: string;
    phone?: string;
  };
  panel_info?: {
    panel_type?: string;
    address?: string;
    nickname?: string;
  };
  draft_delivery_method?: string;
  // 메모 컬럼 없음
  panel_slot_snapshot?: {
    tax_price?: number;
    road_usage_fee?: number;
    advertising_fee?: number;
    total_price?: number;
  };
  payments?: Array<{
    payment_method?: string;
    depositor_name?: string;
    card_company?: string;
    card_owner?: string;
  }>;
}

interface OrderDetailExpandedProps {
  orderDetail: Partial<OrderDetail>;
  onClose?: () => void;
}

const OrderDetailExpanded: React.FC<OrderDetailExpandedProps> = ({
  orderDetail,
  onClose,
}) => {
  // 결제정보 분기
  const payment = orderDetail.payments?.[0] || {};
  const isBank = payment.payment_method === '무통장입금';
  const isCard = payment.payment_method === '카드결제';

  return (
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col items-start gap-6 p-0">
      {/* 1. 주문번호 */}
      <div className="flex justify-between text-white items-center bg-black w-full py-4">
        <div className="flex items-center gap-7 px-10">
          <span className="">주문번호</span>
          <span className="">{orderDetail.order_number ?? '-'}</span>
        </div>
      </div>
      {/* 2. 파일이름 */}
      <div className="w-full px-10 pt-6">
        <div className="font-bold text-xl mb-2">파일이름</div>
        <div className="text-lg">{orderDetail.project_name ?? '-'}</div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="828"
        height="2"
        viewBox="0 0 828 2"
        fill="none"
      >
        <path d="M828 1L2.00272e-05 1" stroke="#E0E0E0" />
      </svg>
      {/* 3. 접수자명, 연락처, 회사명 */}
      <div className="w-full px-10 pt-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">접수자명</div>
          <div className="font-bold">
            {orderDetail.user_profile?.profile_title ?? '-'}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">연락처</div>
          <div className="font-bold">
            {orderDetail.user_profile?.phone ?? '-'}
          </div>
        </div>
        {orderDetail.user_profile?.company_name && (
          <div className="col-span-2 flex gap-4">
            <div className="text-gray-600 mb-1">회사명</div>
            <div className="font-bold">
              {orderDetail.user_profile.company_name}
            </div>
          </div>
        )}
      </div>
      {/* 4. 품명, 위치, 파일제출방식, 메모 */}
      <div className="flex flex-col gap-4 w-full px-10 pt-6 gap-4">
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">품명</div>
          <div className="font-bold">
            {orderDetail.panel_info?.panel_type ?? '-'}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">위치</div>
          <div className="font-bold">
            {orderDetail.panel_info?.address ?? '-'}
            {orderDetail.panel_info?.nickname
              ? ` (${orderDetail.panel_info.nickname})`
              : ''}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">파일</div>
          <div className="font-bold">
            {orderDetail.draft_delivery_method === 'email'
              ? '이메일로 제출하겠습니다.'
              : orderDetail.draft_delivery_method === 'file'
              ? '파일로 제출하겠습니다.'
              : '-'}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-gray-600 mb-1">메모</div>
          <div className="font-bold">(최대 3줄까지 입력 가능합니다.)</div>
        </div>
      </div>
      {/* 5. 가격정보 */}
      <div className="w-full px-10 pt-6 ">
        <div className="font-bold mb-2">가격정보</div>
        <div className="flex flex-col gap-4 gap-4">
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">광고대행비</div>
            <div className="font-bold">
              {orderDetail.panel_slot_snapshot?.advertising_fee?.toLocaleString() ??
                '0'}
              원
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">부가세</div>
            <div className="font-bold">
              {orderDetail.panel_slot_snapshot?.tax_price?.toLocaleString() ??
                '0'}
              원
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">도로사용료</div>
            <div className="font-bold">
              {orderDetail.panel_slot_snapshot?.road_usage_fee?.toLocaleString() ??
                '0'}
              원
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">총금액</div>
            <div className="font-bold">
              {orderDetail.panel_slot_snapshot?.total_price?.toLocaleString() ??
                '0'}
              원
            </div>
          </div>
        </div>
      </div>
      {/* 6. 결제정보 */}
      <div className="w-full px-10 pt-6 flex gap-6 ">
        <div className="font-bold mb-2">결제정보</div>
        {isBank && (
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">무통장입금</div>
            <div className="font-bold">
              입금자명: {payment.depositor_name ?? '-'}
            </div>
          </div>
        )}
        {isCard && (
          <div className="flex gap-4">
            <div className="text-gray-600 mb-1">카드결제</div>
            <div className="font-bold">
              카드사: {payment.card_company ?? '-'}
            </div>
            <div className="font-bold">
              카드 소유자: {payment.card_owner ?? '-'}
            </div>
          </div>
        )}
        {!isBank && !isCard && (
          <div className="text-gray-500">결제정보 없음</div>
        )}
      </div>
      {/* 하단 버튼 */}
      <div className="w-full flex gap-3 justify-center py-8 border-t mt-8">
        <button className="px-6 py-2 rounded-lg text-base font-medium bg-red-100 text-red-700 hover:bg-red-200">
          신청취소
        </button>
        <button className="px-6 py-2 rounded-lg text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          파일재접수
        </button>
        <button className="px-6 py-2 rounded-lg text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          영수증
        </button>
        <button
          className="px-6 py-2 rounded-lg text-base font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default OrderDetailExpanded;
