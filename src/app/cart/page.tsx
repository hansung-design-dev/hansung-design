'use client';
import { motion } from 'framer-motion';
import Nav from '@/src/components/layouts/nav';
import Link from 'next/link';
import { useCart } from '@/src/contexts/cartContext';
import { ledItems, bannerItems } from '@/src/mock/billboards';
import { Button } from '@/src/components/button/button';
import { useState } from 'react';

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
  const [checkedIds, setCheckedIds] = useState<string[]>(
    cart.map((item) => String(item.id))
  );

  const allItems = [...ledItems, ...bannerItems];
  const checkedTotal = cart.reduce((total, item) => {
    if (!checkedIds.includes(String(item.id))) return total;
    const found = allItems.find((ai) => ai.id === String(item.id));
    return total + (found?.price || 0);
  }, 0);

  return (
    <main className="pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
      {/* 디버깅용: cart 배열 단순 출력 */}
      {/* <div className="bg-yellow-100 p-4 mb-4 rounded">
        <h2 className="font-bold mb-2">[디버깅] 현재 장바구니(cart) 배열</h2>
        <ul className="list-disc list-inside">
          {cart.map((item) => {
            const allItems = [...ledItems, ...bannerItems];
            console.log('allItems:', allItems);
            const found = allItems.find(
              (ai) => ai.id === '2648385d-6f4b-4421-89b6-ab6c68fc8daf'
            );

            return (
              <li key={item.id}>
                [{found?.region_gu || '구 없음'} /{' '}
                {found?.region_dong || '동 없음'}] {item.name} / {item.type} /{' '}
                {item.district} / {item.price}
              </li>
            );
          })}
        </ul>
      </div> */}
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
            {[1, 2].map((groupIdx) => (
              <div key={groupIdx} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-2 mb-4 border-b-solid border-black border-b-[3px] pb-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-[1.75rem] h-[1.75rem]  border-solid border-gray-9 border-[0.2rem] rounded-[0.25rem]"
                  />
                  <h2 className="pt-1 text-1.25 font-700">현수막 게시대</h2>
                </div>

                <div className="border-t border-gray-300 pt-4 space-y-4">
                  {[1, 2].map((itemIdx) => (
                    <div
                      key={itemIdx}
                      className=" rounded-lg p-4 flex justify-between items-start"
                    >
                      <div className="flex justify-between items-center w-full border border-solid border-gray-8 px-[1.5rem] rounded-[0.25rem]">
                        <div>
                          <h3 className="font-semibold mb-1">등록명</h3>
                          <p>고객이름</p>
                          <p>고객전화번호</p>
                          <p>이메일</p>
                        </div>

                        <Button
                          variant="ghost"
                          className="bg-gray-4 h-[2.5rem]"
                        >
                          주문수정
                        </Button>
                      </div>
                    </div>
                  ))}

                  <ul className="text-0.875 text-gray-7 mt-2 list-disc list-inside line-height-[1.25rem]">
                    <li>작업이 진행 된 후 환불이 불가한 상품입니다.</li>
                    <li>설 명절로 인해 2.1부터 진행됩니다.</li>
                    <li>기타 안내 사항이 들어가는 부분</li>
                  </ul>
                </div>
              </div>
            ))}
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
