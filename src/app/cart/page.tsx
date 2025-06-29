'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/src/contexts/cartContext';
import { useState, useEffect } from 'react';
import CartItemAccordion from '@/src/components/cartItemAccordion';

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
  const [timeLeft, setTimeLeft] = useState<string>('');

  // 디버깅용: cart 배열 상태 확인
  console.log('🔍 Cart state in /cart page:', cart);
  console.log('🔍 Cart length:', cart.length);

  // 남은 시간 계산
  useEffect(() => {
    const calculateTimeLeft = () => {
      const stored = localStorage.getItem('hansung_cart');
      if (!stored) return;

      try {
        const cartState = JSON.parse(stored);
        const now = Date.now();
        const timeElapsed = now - cartState.lastUpdated;
        const timeRemaining = 15 * 60 * 1000 - timeElapsed; // 15분 - 경과시간

        if (timeRemaining <= 0) {
          setTimeLeft('만료됨');
          return;
        }

        const minutes = Math.floor(timeRemaining / (1000 * 60));
        setTimeLeft(`${minutes}분`);
      } catch (error) {
        console.error('Error calculating time left:', error);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [cart.length]);

  const checkedTotal = cart.reduce((total, item) => {
    if (typeof item.price === 'number') {
      return total + item.price;
    }
    return total;
  }, 0);

  // 분류
  const ledItems = cart.filter((item) => item.type === 'led-display');
  const bannerItems = cart.filter((item) => item.type === 'banner-display');

  return (
    <main className="pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="px-4 py-20"
      >
        {/* Layout: Items Left, Summary Right */}
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Left: Cart Items */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* 남은 시간 표시 */}
              {cart.length > 0 && (
                <div className="text-sm text-red-500 font-medium mb-4">
                  ⏰ 장바구니 만료까지: {timeLeft}
                </div>
              )}

              <div className="border-t border-gray-300 pt-4 space-y-4">
                {/* LED전자게시대 그룹 */}
                {ledItems.length > 0 && (
                  <section className="mb-10">
                    <div className="text-1.5 font-bold border-b-solid border-black border-b-[3px] mb-4">
                      LED전자게시대
                    </div>
                    {ledItems.map((item) => (
                      <CartItemAccordion key={item.id} item={item} />
                    ))}
                  </section>
                )}
                {/* 현수막게시대 그룹 */}
                {bannerItems.length > 0 && (
                  <section className="mb-10">
                    <div className="text-1.25 font-500 border-b-solid border-black border-b-[3px] pb-4 mb-4">
                      현수막게시대
                    </div>
                    {bannerItems.map((item) => (
                      <CartItemAccordion key={item.id} item={item} />
                    ))}
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary & Terms (기존 결제/요약 UI 그대로) */}
          <div className="w-full lg:w-[24rem] space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4 border border-b-solid border-gray-1 pb-4 border-b-[2px]">
                최종 결제 금액
              </h3>
              <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
                <div className="flex justify-between py-1 ">
                  <span>주문금액</span>
                  <span>{checkedTotal.toLocaleString()}원</span>
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
                  {checkedTotal.toLocaleString()}원
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
