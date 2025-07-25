import { Button } from '@/src/components/button/button';

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
  advertisingFee: number;
  roadUsageFee: number;
  totalAmount: number;
  paymentMethod: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
  // 추가 필드들
  projectName?: string; // 파일이름 (design_draft.project_name)
  displayStartDate?: string; // 송출 시작일
  displayEndDate?: string; // 송출 종료일
}

interface OrderItemCardProps {
  orderDetail: OrderDetail;
  onClose?: () => void; // 아코디언 닫기 콜백 추가
  onCancel?: () => void; // 신청취소 콜백 추가
}

export default function OrderItemCard({
  orderDetail,
  onClose,
  onCancel,
}: OrderItemCardProps) {
  return (
    <div className="rounded-lg overflow-hidden py-[2rem] sm:py-4">
      <div className="flex items-center justify-center ">
        <div className=" border border-solid border-gray-3 bg-white flex flex-col gap-4 items-center justify-center w-full ">
          <div className="w-full h-[6.125rem] bg-black text-white py-2 flex items-center text-1.5 font-700 gap-6 sm:h-[4rem] sm:text-1.25 sm:gap-4 pl-[4rem]">
            <div>주문번호</div>
            <div>{orderDetail.order_number}</div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-4 items-start justify-center">
              <div className="flex flex-col text-start gap-2 pt-4 sm:pt-2 pl-6">
                <div className="text-1.25 font-500 sm:text-1">파일이름</div>
                <div className="text-1.75 font-700 mb-4 sm:text-1.5">
                  {orderDetail.projectName || ''}
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="828"
                height="2"
                viewBox="0 0 828 2"
                fill="none"
                className="sm:w-full"
              >
                <path d="M828 1L2.00272e-05 1" stroke="#E0E0E0" />
              </svg>

              <div className="grid grid-cols-[8rem_1fr] gap-[7rem] sm:gap-[3rem]  w-full px-[2rem] pt-8 text-1.25 sm:grid-cols-[6rem_1fr] sm:gap-y-2 sm:px-4 sm:pt-4 sm:text-1">
                <div className="text-gray-600 mb-2">접수자명</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.customerName}
                </div>

                <div className="text-gray-600 mb-2">연락처</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.phone}
                </div>

                <div className="col-span-2 border-t border-gray-3 my-2 sm:col-span-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="828"
                    height="2"
                    viewBox="0 0 828 2"
                    fill="none"
                    className="sm:w-full"
                  >
                    <path d="M828 1L2.00272e-05 1" stroke="#E0E0E0" />
                  </svg>
                </div>

                <div className="text-gray-600 mb-2">품명</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.category}
                </div>

                <div className="text-gray-600 mb-2">위치</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.location}
                </div>

                <div className="text-gray-600 mb-2">송출기간</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.displayStartDate}
                </div>

                <div className="col-span-2 border-t border-gray-3 my-2 sm:col-span-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="828"
                    height="2"
                    viewBox="0 0 828 2"
                    fill="none"
                    className="sm:w-full"
                  >
                    <path d="M828 1L2.00272e-05 1" stroke="#E0E0E0" />
                  </svg>
                </div>
                <div className="text-gray-600 mb-2">광고 대행료</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.advertisingFee?.toLocaleString?.() ?? '-'}원
                </div>

                <div className="text-gray-600 mb-2">부가세</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.vat?.toLocaleString?.() ?? '-'}원
                </div>

                <div className="text-gray-600 mb-2">도로사용료</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.roadUsageFee?.toLocaleString?.() ?? '-'}원
                </div>

                <div className="font-bold text-gray-600">총액</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.totalAmount?.toLocaleString?.() ?? '-'}원
                </div>

                <div className="col-span-2 border-t border-[#E0E0E0] my-2 sm:col-span-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="828"
                    height="2"
                    viewBox="0 0 828 2"
                    fill="none"
                    className="sm:w-full"
                  >
                    <path d="M828 1L2.00272e-05 1" stroke="#E0E0E0" />
                  </svg>
                </div>
                <div className="text-gray-500 col-span-2 sm:col-span-2 mb-2">
                  {orderDetail.paymentMethod}
                </div>
                <div className="text-gray-600 mb-2">입금자명</div>
                <div className="sm:w-full">{orderDetail.depositorName}</div>
              </div>
            </div>
          </div>
          {/* 버튼 */}
          <div className="flex flex-col gap-2 py-[3rem] items-center justify-center sm:py-6">
            <div className="flex gap-[1rem] sm:w-full items-center justify-center">
              <Button
                variant="outlinedGray"
                size="xs"
                className={`text-black sm:text-0.75 rounded-full ${
                  !orderDetail.canCancel ? 'cursor-not-allowed' : ''
                }`}
                disabled={!orderDetail.canCancel}
                onClick={onCancel}
              >
                신청 취소
              </Button>
              <Button
                variant="outlinedGray"
                size="xs"
                className="text-black sm:text-0.75 sm:w-[9rem] rounded-full"
              >
                파일재전송
              </Button>
              <Button
                variant="outlinedGray"
                size="xs"
                className="text-black sm:text-0.75 rounded-full"
              >
                영수증
              </Button>
              <Button
                variant="outlinedGray"
                size="xs"
                className="text-black sm:text-0.75 rounded-full"
                onClick={onClose}
              >
                목록
              </Button>
            </div>
            {!orderDetail.canCancel && (
              <div className="text-sm text-gray-500 text-center mt-2 flex items-center justify-center">
                * 신청취소는 신청후 3일이내만 취소 가능합니다. 3일 이후 취소시
                고객센터에 문의 부탁드립니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
