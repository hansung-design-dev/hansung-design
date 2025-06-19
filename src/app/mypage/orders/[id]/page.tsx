'use client';

import { useParams } from 'next/navigation';
import Nav from '../../../../components/layouts/nav';
import MypageNav from '../../../../components/mypageNav';
import OrderItemCard from '../../../../components/orderItemCard';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for order details
const mockOrderDetails = {
  1: {
    id: 1,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '진행중',
    category: '공공디자인',
    orderNumber: '01019293485',
    fileName: '한성 메인 광고',
    customerName: '홍길동',
    phone: '010.0000.0000',
    productName: '공공디자인',
    fileSubmission: '이메일로 제출하겠습니다.',
    memo: '메모가 있다면\n최대\n3줄까지 가능합니다.',
    price: 500000,
    vat: 55000,
    designFee: 120000,
    additionalFee: 0,
    totalAmount: 675000,
    paymentMethod: '무통장입금',
    depositorName: '홍길동',
  },
  2: {
    id: 2,
    title: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
    location: '방이동',
    status: '송출중',
    category: 'LED전자게시대',
    orderNumber: '01019293486',
    fileName: 'LED 디스플레이 광고',
    customerName: '김철수',
    phone: '010.1111.1111',
    productName: 'LED전자게시대',
    fileSubmission: '이메일로 제출하겠습니다.',
    memo: '밝기 조절 부탁드립니다.',
    price: 800000,
    vat: 88000,
    designFee: 150000,
    additionalFee: 0,
    totalAmount: 1038000,
    paymentMethod: '무통장입금',
    depositorName: '김철수',
  },
  // Add more mock data as needed
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const orderDetail =
    mockOrderDetails[orderId as keyof typeof mockOrderDetails];

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  if (!orderDetail) {
    return (
      <main className="min-h-screen flex flex-col bg-white w-full">
        <Nav variant="default" className="bg-white sm:px-0" />
        <div className="flex justify-center bg-[#F1F1F1] md:bg-[#F1F1F1] sm:bg-white">
          <div className="container px-4 pt-[7rem] pb-[10rem] lg:max-w-[1000px]">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-4">
                주문을 찾을 수 없습니다
              </h2>
              <Link
                href="/mypage/orders"
                className="text-blue-600 hover:underline"
              >
                주문 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-white w-full">
      <Nav variant="default" className="bg-white sm:px-0" />

      <div className="flex justify-center bg-[#F1F1F1] md:bg-[#F1F1F1] sm:bg-white">
        <div className="container px-4 pt-[7rem] pb-[10rem] lg:max-w-[1000px]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Navigation */}
            <MypageNav
              tabs={tabs}
              activeTab="주문내역"
              setActiveTab={() => {}}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white lg:p-8 md:p-8 sm:p-0 rounded-lg w-full">
              <div className="sm:flex sm:flex-col sm:gap-2 sm:px-0">
                <Link
                  href="/mypage/orders"
                  className="md:hidden lg:hidden sm:inline"
                >
                  <Image
                    src="/svg/arrow-left.svg"
                    alt="back"
                    width={20}
                    height={20}
                    className="w-[1.5rem] h-[1.5rem]"
                  />
                </Link>
                <h2 className="text-2.25 font-500 mb-3 sm:text-2">주문 상세</h2>
              </div>

              <OrderItemCard orderDetail={orderDetail} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
