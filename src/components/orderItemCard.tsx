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
  designFee: number;
  roadUsageFee: number;
  totalAmount: number;
  paymentMethod: string;
  depositorName: string;
  orderDate: string;
  canCancel: boolean;
  daysSinceOrder: number;
}

interface OrderItemCardProps {
  orderDetail: OrderDetail;
}

export default function OrderItemCard({ orderDetail }: OrderItemCardProps) {
  return (
    <div className="rounded-lg overflow-hidden py-[2rem] sm:py-4">
      <div className="bg-white px-12 flex justify-between items-center pb-8 sm:flex-col sm:gap-4 sm:px-0 lg:flex-row sm:w-full sm:items-center">
        <div className="text-1.25 font-500 sm:text-1 ">{orderDetail.title}</div>
        <div className="flex gap-[3rem] justify-center items-center text-1.25 text-black sm:flex-row sm:justify-around sm:w-full sm:gap-2 sm:text-1 lg:gap-[2rem]">
          <div className="flex flex-col sm:flex-row sm:gap-4 lg:gap-[2rem]">
            <span className="">{orderDetail.location}</span>
            <span className="">{orderDetail.status}</span>
          </div>
          <Button
            size="sm"
            variant="outlineGray"
            className={`text-black ${
              !orderDetail.canCancel ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!orderDetail.canCancel}
          >
            신청 취소
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center sm:px-4">
        <div className="px-[1.9rem] border border-solid border-gray-3 bg-white flex flex-col gap-4 items-center justify-center w-full sm:px-4">
          <div className="w-full h-[6.125rem] bg-black text-white py-2 flex items-center text-1.5 font-700 gap-6 pl-[4rem] sm:h-[4rem] sm:text-1.25 sm:gap-4 sm:pl-4">
            <div>주문번호</div>
            <div>{orderDetail.order_number}</div>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-4 items-start justify-center">
              <div className="flex flex-col text-start gap-2 pt-4 sm:pt-2">
                <div className="text-1.25 font-500 sm:text-1">파일이름</div>
                <div className="text-1.75 font-700 mb-4 sm:text-1.5">
                  {orderDetail.companyName || '기본정보'}
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
                  {orderDetail.productName}
                </div>

                <div className="text-gray-600 mb-2">위치</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.title}
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
                <div className="text-gray-600 mb-2">상품가</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.price.toLocaleString()}원
                </div>

                <div className="text-gray-600 mb-2">부가세</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.vat.toLocaleString()}원
                </div>

                <div className="text-gray-600 mb-2">디자인비</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.designFee.toLocaleString()}원
                </div>

                <div className="text-gray-600 mb-2">도로사용료</div>
                <div className="text-1.25 sm:text-1">
                  {orderDetail.roadUsageFee.toLocaleString()}원
                </div>

                <div className="font-bold text-gray-600">총액</div>
                <div className="font-700 text-1.25 sm:text-1">
                  {orderDetail.totalAmount.toLocaleString()}원
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
            {/* 버튼 */}
            <div className="flex flex-col gap-2 py-[3rem] items-center justify-center sm:py-6">
              <div className="flex gap-[1rem] sm:w-full">
                <Button
                  variant="outlineGray"
                  size="xs"
                  className={`text-black sm:text-0.75 ${
                    !orderDetail.canCancel
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={!orderDetail.canCancel}
                >
                  신청 취소
                </Button>
                <Button
                  variant="outlineGray"
                  size="xs"
                  className="text-black sm:text-0.75 sm:w-[9rem]"
                >
                  파일재전송
                </Button>
                <Button
                  variant="outlineGray"
                  size="xs"
                  className="text-black sm:text-0.75"
                >
                  영수증
                </Button>
                <Button
                  variant="outlineGray"
                  size="xs"
                  className="text-black sm:text-0.75"
                >
                  목록
                </Button>
              </div>
              {!orderDetail.canCancel && (
                <div className="text-sm text-gray-500 text-center mt-2">
                  * 신청취소는 신청후 3일이내만 취소 가능합니다. 3일 이후 취소시
                  고객센터에 문의 부탁드립니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
