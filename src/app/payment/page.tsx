import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        {/* 좌측 - 현수막 게시대 카드 2개 */}
        <div className="space-y-8 border border-solid border-gray-3 rounded-[0.375rem] p-[2.5rem]">
          {[1, 2].map((_, index) => (
            <section
              key={index}
              className="p-6 border rounded-lg shadow-sm flex flex-col gap-4"
            >
              <div>
                <div>
                  <h2 className="text-1.25 text-gray-2 font-bold mb-4 border-b border-b-solid border-black border-b-[0.4rem] pb-4">
                    현수막 게시대
                  </h2>
                </div>
                <div className="mb-4">
                  <div className="text-1.25 font-700 text-[#222]">
                    올림픽대로 반포사거리 앞 (반포 우수저장)
                  </div>
                </div>
                <div className="flex items-center gap-2 border border-solid border-gray-12 rounded-[0.375rem] p-4 bg-gray-11">
                  <input type="checkbox" className="w-[1.75rem] h-[1.75rem]" />
                  <div className="text-1.25 font-700">기업 1 이름</div>
                </div>
              </div>

              <div className="text-1 text-gray-10">
                <h3 className="text-1.25 font-600 mb-2 text-[#222]">
                  고객 정보
                </h3>
                <form className="flex flex-col gap-5 ">
                  <div className="flex flex-col gap-4">
                    {/* 작업이름 */}
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-[9rem] text-gray-600 font-medium">
                        작업이름
                      </label>
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem] w-[21.25rem]"
                        placeholder="파일 이름"
                      />
                    </div>

                    {/* 휴대폰 번호 */}
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-[9rem] text-gray-600 font-medium">
                        휴대폰 번호
                      </label>
                      <div className="flex flex-1 gap-2">
                        <input
                          type="text"
                          className="border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem] w-full "
                          placeholder="010 - 1234 - 5678"
                        />
                      </div>
                    </div>

                    {/* 파일업로드 */}
                    <div className="flex items-start justify-between gap-4">
                      <label className="w-[9rem] text-gray-600 font-medium pt-2">
                        파일업로드
                      </label>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          className="border border-gray-300  py-2 w-full rounded"
                        />
                        <div className="flex flex-col gap-2 items-start">
                          <div className="text-sm text-gray-500">
                            이메일로 파일 보낼게요
                          </div>
                          <input
                            type="text"
                            className=" border border-gray-300 border-solid shadow-none rounded  h-[3rem] w-[20rem] placeholder:pl-4"
                            placeholder="파일 이름"
                          />
                        </div>
                      </div>
                    </div>
                    {/* 쿠폰번호 */}
                    <div className="flex items-center justify-between gap-4">
                      <label className="w-[9rem] text-gray-600 font-medium">
                        쿠폰번호
                      </label>
                      <div className="flex flex-1">
                        <input
                          type="text"
                          className="border border-gray-300 border-solid shadow-none rounded px-4 h-[3rem] w-[12rem]"
                        />
                      </div>
                      <button
                        type="button"
                        className="w-[5rem] bg-black text-white rounded-[0.375rem] h-[3rem]"
                      >
                        확인
                      </button>
                    </div>

                    {/* 세금계산서 */}
                    <div className="flex items-center gap-2">
                      <label className="w-[9rem] text-gray-600 font-medium">
                        세금계산서
                      </label>
                      <div className="flex items-center gap-2 pl-2">
                        <input type="checkbox" className="w-5 h-5" />
                        <label className="text-gray-600 font-medium">
                          세금계산서 신청
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      className="bg-gray-4 w-[8rem] text-0.875 p-1"
                    >
                      변경된 내용 저장
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          ))}

          <section className="p-6 bg-white rounded-lg shadow-md ">
            <h3 className="text-lg font-bold mb-4">결제수단</h3>
            <div className="flex flex-col space-x-4 gap-3 items-center justify-center">
              <button className="border-solid border-gray-3 border-[0.1rem] rounded-[0.375rem] px-4 py-6 w-full bg-gray-11 text-1.25 font-700">
                신용 · 체크카드
              </button>
              <div className="w-full flex gap-4 items-center justify-between">
                <button className="border-solid border-gray-3 border-[0.1rem] rounded-[0.375rem] p-4 w-full">
                  <Image
                    src="/svg/naver-pay.svg"
                    alt="Naver Pay"
                    className="h-6 mx-auto"
                    width={80}
                    height={80}
                  />
                </button>
                <button className="border-solid border-gray-3 border-[0.1rem] rounded-[0.375rem] p-4 w-full">
                  <Image
                    src="/svg/kakao-pay.svg"
                    alt="Kakao Pay"
                    className="h-6 mx-auto"
                    width={80}
                    height={80}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 우측 - 결제 영역 */}
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

          <button className="w-full bg-black text-white py-6 rounded-lg hover:bg-gray-800 transition-colors">
            <Link href="/payment" className="text-white">
              결제하기
            </Link>
          </button>
        </div>
      </div>
    </main>
  );
}
