import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
//import { motion } from 'framer-motion';
import Nav from '@/src/components/layouts/nav';

// const fadeInUp = {
//   initial: { y: 60, opacity: 0 },
//   animate: {
//     y: 0,
//     opacity: 1,
//     transition: { duration: 0.6, ease: 'easeOut' },
//   },
// };

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-white pt-[5.5rem] bg-gray-100 min-h-screen lg:px-[10rem]">
      <Nav variant="default" className="bg-white" />

      <div className="container mx-auto px-4 sm:px-1 py-8 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 - 현수막 게시대 카드 2개 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem] sm:p-[1.5rem]">
          {[1, 2].map((_, index) => (
            <section
              key={index}
              className="p-6 border rounded-lg shadow-sm flex flex-col gap-4 sm:p-2"
            >
              <div>
                <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b border-black border-b-[0.4rem] pb-4">
                  현수막 게시대
                </h2>
                <div className="mb-4 text-1.25 font-700 text-[#222] sm:text-0.875">
                  올림픽대로 반포사거리 앞 (반포 우수저장)
                </div>
                <div className="flex items-center gap-2 border border-solid border-gray-12 rounded-[0.375rem] p-4 bg-gray-11 sm:p-2">
                  <input
                    type="checkbox"
                    className="w-[1.75rem] h-[1.75rem] sm:w-[0.875rem] sm:h-[0.875rem]"
                  />
                  <div className="text-1.25 font-700 sm:text-0.875">
                    기업 1 이름
                  </div>
                </div>
              </div>

              <div className="text-1 text-gray-10">
                <h3 className="text-1.25 font-600 mb-2 text-[#222] sm:pb-5">
                  고객 정보
                </h3>
                <form className="flex flex-col gap-5 ">
                  <div className="flex flex-col gap-4 sm:gap-8">
                    {/* 작업이름 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        작업이름
                      </label>
                      <input
                        type="text"
                        className="w-full md:w-[21.25rem] sm:w-[13rem] border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem]"
                        placeholder="파일 이름"
                      />
                    </div>

                    {/* 휴대폰 번호 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        휴대폰 번호
                      </label>
                      <input
                        type="text"
                        className="w-full md:w-[21.25rem] sm:w-[13rem]  border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem]"
                        placeholder="010 - 1234 - 5678"
                      />
                    </div>

                    {/* 파일업로드 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium pt-2">
                        파일업로드
                      </label>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          className="border border-gray-300 py-2 w-full rounded"
                        />
                        <div className="flex flex-col gap-2 items-start">
                          <div className="text-sm text-gray-500">
                            이메일로 파일 보낼게요
                          </div>
                          <input
                            type="text"
                            className="border border-gray-300 border-solid shadow-none rounded h-[3rem] w-full md:w-[20rem] sm:w-[14.4rem] placeholder:pl-4"
                            placeholder="파일 이름"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 쿠폰번호 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        쿠폰번호
                      </label>
                      <div className="flex gap-2 w-full md:w-[21.25rem]">
                        <input
                          type="text"
                          className="w-1/2 border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem]"
                          placeholder="쿠폰번호 입력"
                        />
                        <button
                          type="button"
                          className="w-1/2 bg-black text-white rounded-[0.375rem] h-[3rem]"
                        >
                          확인
                        </button>
                      </div>
                    </div>

                    {/* 세금계산서 */}
                    <div className="flex flex-col sm:flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 sm:gap-2">
                      <label className="w-full md:w-[9rem] text-gray-600 font-medium">
                        세금계산서
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 sm:w-4 sm:h-4"
                        />
                        <label className="text-gray-600 font-medium sm:text-0.875">
                          세금계산서 신청
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end ">
                    <Button
                      variant="ghost"
                      className="bg-gray-4 w-full md:w-[8rem] text-0.875 p-1 sm:w-[10rem] sm:mb-6"
                    >
                      변경된 내용 저장
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          ))}

          <section className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-1.25 font-700 mb-4 sm:text-1">결제수단</h3>
            <div className="flex flex-col gap-3 items-center justify-center">
              <button className="border border-gray-3 rounded-[0.375rem] px-4 py-6 w-full bg-gray-11 text-1.25 font-700 sm:text-1 sm:py-4">
                신용 · 체크카드
              </button>
              <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                  <Image
                    src="/svg/naver-pay.svg"
                    alt="Naver Pay"
                    width={80}
                    height={80}
                    className="sm:w-[3rem] sm:h-[3rem]"
                  />
                </button>
                <button className="border border-gray-3 rounded-[0.375rem] p-4 w-full sm:h-[3rem] sm:flex sm:items-center sm:justify-center">
                  <Image
                    src="/svg/kakao-pay.svg"
                    alt="Kakao Pay"
                    width={80}
                    height={80}
                    className="sm:w-[3rem] sm:h-[3rem]"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 우측 - 결제 영역 */}
        <div className="w-full md:w-[24rem] space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-1.25 mb-4 border-b border-gray-1 pb-4 border-b-[2px]">
              최종 결제 금액
            </h3>
            <div className="flex flex-col gap-[0.88rem] text-1 font-500 text-gray-2">
              <div className="flex justify-between py-1">
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
            <div className="flex justify-between items-center mt-4 border-t border-gray-1 pt-7 sm:flex-col sm:gap-4">
              <span className="text-1.25 font-900">최종 결제 금액</span>
              <span className="text-1.875 font-900">
                1,250,000 <span className="text-1 font-400">원</span>
              </span>
            </div>
          </div>

          <button className="w-full bg-black text-white py-6 rounded-lg hover:bg-gray-800 transition-colors">
            <Link href="/payment" className="text-white sm:text-1.25">
              결제하기
            </Link>
          </button>
        </div>
      </div>
    </main>
  );
}
