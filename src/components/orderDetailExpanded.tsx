import React from 'react';

interface OrderDetail {
  id: string;
  order_number: string;
  title: string;
  location: string;
  status: string;
  category: string;
  customerName: string;
  phone: string;
  companyName: string;
  productName: string;
  price: number;
  vat: number;
  designFee: number;
  roadUsageFee: number;
  totalAmount: number;
  paymentMethod: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
  panel_slot_snapshot?: {
    id: string | null;
    notes: string | null;
    max_width: number | null;
    slot_name: string | null;
    tax_price: number | null;
    created_at: string | null;
    is_premium: boolean | null;
    max_height: number | null;
    price_unit: string | null;
    updated_at: string | null;
    banner_type: string | null;
    slot_number: number | null;
    total_price: number | null;
    panel_info_id: string | null;
    road_usage_fee: number | null;
    advertising_fee: number | null;
    panel_slot_status: string | null;
  };
  panel_slot_usage_id?: string;
}

interface OrderDetailExpandedProps {
  orderDetail: OrderDetail;
  onClose: () => void;
}

const OrderDetailExpanded: React.FC<OrderDetailExpandedProps> = ({
  orderDetail,
  onClose,
}) => {
  console.log('OrderDetailExpanded 렌더링:', orderDetail);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">주문 상세 정보</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">기본 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">주문번호:</span>
              <span className="font-medium">{orderDetail.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">주문일:</span>
              <span>{orderDetail.orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상태:</span>
              <span
                className={`font-medium ${
                  orderDetail.status === '결제완료'
                    ? 'text-green-600'
                    : orderDetail.status === '결제대기'
                    ? 'text-blue-600'
                    : orderDetail.status === '완료'
                    ? 'text-orange-600'
                    : 'text-gray-600'
                }`}
              >
                {orderDetail.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상품명:</span>
              <span>{orderDetail.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">위치:</span>
              <span>{orderDetail.location}</span>
            </div>
          </div>
        </div>

        {/* 고객 정보 */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">고객 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">고객명:</span>
              <span>{orderDetail.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">연락처:</span>
              <span>{orderDetail.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">회사명:</span>
              <span>{orderDetail.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">입금자명:</span>
              <span>{orderDetail.depositorName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 가격 정보 */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">가격 정보</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">기본 가격:</span>
              <span>{(orderDetail.price || 0).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">부가세:</span>
              <span>{(orderDetail.vat || 0).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">디자인비:</span>
              <span>{(orderDetail.designFee || 0).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">도로점용료:</span>
              <span>{(orderDetail.roadUsageFee || 0).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>총 결제금액:</span>
              <span className="text-lg">
                {(orderDetail.totalAmount || 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 정보 */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">결제 정보</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">결제 방법:</span>
            <span>{orderDetail.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-6 flex gap-3">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            orderDetail.canCancel
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!orderDetail.canCancel}
        >
          주문 취소
        </button>
        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          문의하기
        </button>
      </div>
    </div>
  );
};

export default OrderDetailExpanded;
