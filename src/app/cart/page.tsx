'use client';
import { Button } from '@/src/components/button/button';
import { motion } from 'framer-motion';
import Nav from '@/src/components/layouts/nav';
import Link from 'next/link';
import { useCart } from '@/src/contexts/cartContext';
import { billboards, bannerBillboards } from '@/src/mock/billboards';
import type { CartItem } from '@/src/contexts/cartContext';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Cart() {
  const { cart } = useCart();

  // Helper to get full info for each cart item
  function getFullInfo(item: CartItem) {
    if (item.type === 'led-display') {
      const found = billboards.find((b) => b.id === item.id);
      return found
        ? {
            ...item,
            neighborhood: found.neighborhood,
            location: found.district,
          }
        : { ...item, neighborhood: '-', location: '-' };
    } else if (item.type === 'banner-display') {
      const found = bannerBillboards.find((b) => b.id === item.id);
      return found
        ? {
            ...item,
            neighborhood: found.neighborhood,
            location: found.district,
          }
        : { ...item, neighborhood: '-', location: '-' };
    }
    return { ...item, neighborhood: '-', location: '-' };
  }

  const cartWithInfo = cart.map(getFullInfo);
  const totalPrice = cartWithInfo.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );

  return (
    <main className="pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="px-4 py-20"
      >
        <Nav variant="default" className="bg-white" />
        {/* Layout: Items Left, Summary Right */}
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Left: Cart Items */}
          <div className="flex-1 space-y-6 w-full">
            {cartWithInfo.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                장바구니가 비어 있습니다.
              </div>
            ) : (
              cartWithInfo.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-center gap-2 mb-4 border-b-solid border-black border-b-[3px] pb-4">
                    <input
                      type="checkbox"
                      className="mt-1 w-[1.75rem] h-[1.75rem] border border-solid border-gray-9 border-[0.2rem] rounded-[0.25rem]"
                      checked
                      readOnly
                    />
                    <h2 className="pt-1 text-1.25 font-700">
                      {item.type === 'led-display'
                        ? 'LED 전자게시대'
                        : '현수막 게시대'}
                    </h2>
                  </div>
                  <div className="border-t border-gray-300 pt-4 space-y-4">
                    <div className="rounded-lg p-4 flex justify-between items-start">
                      <div className="flex justify-between items-center w-full border border-solid border-gray-8 px-[1.5rem] rounded-[0.25rem]">
                        <div>
                          <h3 className="font-semibold mb-1">등록명</h3>
                          <p>{item.name}</p>
                          <p>
                            {item.neighborhood} / {item.location}
                          </p>
                          <p>-</p>
                          <p>-</p>
                        </div>
                        <Button
                          variant="ghost"
                          className="bg-gray-4 h-[2.5rem]"
                        >
                          주문수정
                        </Button>
                      </div>
                    </div>
                    <ul className="text-0.875 text-gray-7 mt-2 list-disc list-inside line-height-[1.25rem]">
                      <li>작업이 진행 된 후 환불이 불가한 상품입니다.</li>
                      <li>설 명절로 인해 2.1부터 진행됩니다.</li>
                      <li>기타 안내 사항이 들어가는 부분</li>
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Summary & Terms */}
          <div className="w-full lg:w-[24rem] space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4 border border-b-solid border-gray-1 pb-4 border-b-[2px]">
                최종 결제 금액
              </h3>
              <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
                <div className="flex justify-between py-1 ">
                  <span>주문금액</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>기본할인금액</span>
                  <span>-0원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>쿠폰할인금액</span>
                  <span>-0원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>부가세</span>
                  <span>-0원</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 border-t-solid border-gray-1 border-t-[2px] pt-7">
                <span className="text-1.25 font-900">최종 결제 금액</span>
                <span className="text-1.875  font-900">
                  {totalPrice.toLocaleString()}{' '}
                  <span className="text-1 font-400">원</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="flex items-center  gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-[1.3rem] h-[1.3rem] border border-solid border-gray-9 bg-gray-1"
                />
                <span className="text-1.25 font-700">
                  구매조건 및 결제진행 동의
                </span>
              </label>
              <ul className="text-sm text-gray-7 mt-2 list-disc list-inside">
                <li>작업이 진행 된 후 환불이 불가한 상품입니다.</li>
                <li>설 명절로 인해 2.1부터 진행됩니다.</li>
                <li>기타 안내 사항이 들어가는 부분</li>
              </ul>
            </div>

            <button className="w-full bg-black text-white py-6 rounded-lg hover:bg-gray-800 transition-colors">
              <Link href="/payment" className="text-white text-1.25 sm:text-1">
                결제하기
              </Link>
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
