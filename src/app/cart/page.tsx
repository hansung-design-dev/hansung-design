'use client';
import { motion } from 'framer-motion';
import Nav from '@/src/components/layouts/nav';
import Link from 'next/link';
import { useCart } from '@/src/contexts/cartContext';
import { ledItems, bannerItems } from '@/src/mock/billboards';
import { useMemo } from 'react';
import type { CartItem } from '@/src/contexts/cartContext';

interface DisplayItem {
  id: string;
  type: 'led-display' | 'banner-display';
  title: string;
  location: string;
  image: string;
  slots: number;
  price: number;
}

// 1. cart를 구+타입별로 그룹핑, 그 안에서 동+게시대명별로 그룹핑
const groupCart = (cart: CartItem[]) => {
  const allItems = [...ledItems, ...bannerItems];
  cart.forEach((item) => {
    const found = allItems.find((ai) => ai.id === String(item.id));
    console.log('cart item:', item, 'matched allItems:', found);
  });
  const grouped: Record<
    string,
    Record<string, { display: DisplayItem; slots: CartItem[] }>
  > = {};

  cart.forEach((item) => {
    const display = allItems.find(
      (d) => d.id === String(item.id)
    ) as DisplayItem;
    if (!display) return;
    const [gu, dong] = display.location.split(' ');
    const typeLabel =
      display.type === 'led-display' ? 'LED전자게시대' : '현수막게시대';
    const groupKey = `${gu} ${typeLabel}`;
    const displayKey = `${dong} ${typeLabel}`;
    if (!grouped[groupKey]) grouped[groupKey] = {};
    if (!grouped[groupKey][displayKey])
      grouped[groupKey][displayKey] = { display, slots: [] };
    grouped[groupKey][displayKey].slots.push(item);
  });
  return grouped;
};

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
  const groupedCart = useMemo(() => groupCart(cart), [cart]);

  return (
    <main className="pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
      {/* 디버깅용: cart 배열 단순 출력 */}
      <div className="bg-yellow-100 p-4 mb-4 rounded">
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
      </div>
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
            {cart.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                장바구니가 비어 있습니다.
              </div>
            ) : (
              <>
                {/* 구+타입별 그룹핑 */}
                {Object.entries(groupedCart).map(([groupKey, displays]) => (
                  <div key={groupKey} className="mb-10">
                    <div className="border border-dashed border-blue-400 rounded p-2 mb-4">
                      <h2 className="text-xl font-bold text-blue-700">
                        {groupKey}
                      </h2>
                    </div>
                    <div className="space-y-6">
                      {/* 동+게시대명별 카드 */}
                      {Object.entries(displays).map(
                        ([displayKey, { display, slots }]) => (
                          <div
                            key={displayKey}
                            className="border border-dashed border-blue-400 rounded p-4 bg-white"
                          >
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                checked
                                readOnly
                                className="mr-2"
                              />
                              <span className="font-semibold">등록명</span>
                              <span className="ml-2">{displayKey}</span>
                              <button className="ml-auto px-3 py-1 border rounded text-sm">
                                주문수정
                              </button>
                            </div>
                            {/* 슬롯(면) 정보 */}
                            <div className="space-y-4">
                              {slots.map((slot, idx) => (
                                <div
                                  key={slot.id + '-' + idx}
                                  className="bg-gray-50 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                                >
                                  <div>
                                    <div>고객이름</div>
                                    <div>고객전화번호</div>
                                    <div>이메일</div>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <span className="mr-2">
                                      {display.title}
                                    </span>
                                    <span className="font-bold mr-2">
                                      (
                                      {display.type === 'led-display'
                                        ? 'LED'
                                        : '배너'}
                                      )
                                    </span>
                                    <span className="mr-2 text-gray-500">
                                      {display.location}
                                    </span>
                                    <span className="mr-2">
                                      {display.price.toLocaleString()}원
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* 안내문구 */}
                            <ul className="text-sm text-gray-7 mt-2 list-disc list-inside">
                              <li>
                                작업이 진행 된 후 환불이 불가한 상품입니다.
                              </li>
                              <li>설 명절로 인해 2.1부터 진행됩니다.</li>
                              <li>기타 안내 사항이 들어가는 부분</li>
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
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
                  <span>
                    {cart
                      .reduce((total: number, item: CartItem) => {
                        const displayItem = [...ledItems, ...bannerItems].find(
                          (di) => di.id === String(item.id)
                        ) as DisplayItem;
                        return total + (displayItem?.price || 0);
                      }, 0)
                      .toLocaleString()}
                    원
                  </span>
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
                  {cart
                    .reduce((total: number, item: CartItem) => {
                      const displayItem = [...ledItems, ...bannerItems].find(
                        (di) => di.id === String(item.id)
                      ) as DisplayItem;
                      return total + (displayItem?.price || 0);
                    }, 0)
                    .toLocaleString()}
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
