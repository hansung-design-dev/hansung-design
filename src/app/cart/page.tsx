'use client';
import { Button } from '@/src/components/ui/button';
import { motion } from 'framer-motion';
import Nav from '@/src/components/Nav';
import Link from 'next/link';

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Cart() {
  return (
    <main className="pt-[5.5rem] bg-gray-100 min-h-screen">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="container mx-auto px-4 py-20"
      >
        <Nav variant="default" className="bg-white" />
        {/* Layout: Items Left, Summary Right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Cart Items */}
          <div className="flex-1 space-y-6">
            {[1, 2].map((groupIdx) => (
              <div key={groupIdx} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-2 mb-4 border-b-solid border-black border-b-[3px] pb-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-[1.75rem] h-[1.75rem] border border-solid border-gray-9 border-[0.2rem] rounded-[0.25rem]"
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

          {/* Right: Summary & Terms */}
          <div className="w-full lg:w-[24rem] space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4 border border-b-solid border-gray-1 pb-4 border-b-[2px]">
                최종 결제 금액
              </h3>
              <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
                <div className="flex justify-between py-1 ">
                  <span>주문금액</span>
                  <span>1,350,000원</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>기본할인금액</span>
                  <span>-100,000원</span>
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
                  1,250,000 <span className="text-1 font-400">원</span>
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
              <Link href="/payment" className="text-white">
                결제하기
              </Link>
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
