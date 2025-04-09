'use client';

import { useState } from 'react';
import Nav from '../../../components/Nav';
import MypageNav from '@/src/components/mypageNav';
import Image from 'next/image';

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState('1:1상담');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="bg-white" />

      <div className="bg-[#F1F1F1]">
        <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px]">
          <div className="flex gap-8">
            <MypageNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white p-8">
              <div className="flex items-center justify-between gap-8">
                <div className="text-2.25 font-500">1:1 상담</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    <div className="flex flex-col p-6 rounded">
                      <div className="text-lg font-medium mb-4">주문내역</div>
                      <div className="text-3xl font-bold">3건</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    <div className="flex flex-col p-6 rounded">
                      <div className="text-lg font-medium mb-4">
                        송출중 광고
                      </div>
                      <div className="text-3xl font-bold">2건</div>
                    </div>
                  </div>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1088"
                height="2"
                viewBox="0 0 1088 2"
                fill="none"
              >
                <path d="M1088 1L1.33514e-05 1" stroke="#E0E0E0" />
              </svg>

              {/* 유저 질문 리스트 */}
              <div className="mt-12">
                <table className="w-full pb-[2rem]">
                  <tbody>
                    {[
                      {
                        id: 1,
                        text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                        date: '2025-03-01',
                        status: '답변완료',
                      },
                      {
                        id: 2,
                        text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                        date: '2025-03-01',
                        status: '답변준비중',
                      },
                      {
                        id: 3,
                        text: '올림픽대교 남단사거리 앞 (남단 유수지앞)',
                        date: '2025-03-01',
                        status: '답변준비중',
                      },
                    ].map((item) => (
                      <tr
                        key={item.id}
                        className="border border-solid  last:border-none border-black border-b-[3px] text-1.25 font-500"
                      >
                        <td className="px-[2rem] py-4 text-center">
                          {item.id}
                        </td>
                        <td className="px-0 py-4">{item.text}</td>
                        <td className="px-2 py-4 text-center">{item.date}</td>
                        <td className="pr-[4rem] py-4 text-end font-semibold">
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 페이지네이션 */}
                <div className="flex justify-center mt-4 gap-2 text-sm pb-[2rem]">
                  <button className="px-2 py-1 border text-black">1</button>
                  <button className="px-2 py-1 text-gray-400 cursor-not-allowed">
                    2
                  </button>
                  <span className="text-gray-400">▶</span>
                </div>
              </div>

              {/* 하단 정보 */}
              <div className="flex justify-between items-start gap-4 pt-[3rem]">
                {/* 자주 묻는 질문 */}
                <div className="flex flex-col gap-8 flex-1 w-[28rem] border rounded-lg flex-shrink-0 mr-4">
                  <div className="text-1.375 font-semibold  px-[2rem] ">
                    자주 묻는 질문
                  </div>
                  <ul className="space-y-2 text-0.875 text-gray-700">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between border border-b-solid border-gray-3 pb-[1rem] last:border-none last:pb-0 text-0.875 font-500"
                      >
                        <span>게시글</span>
                        <span className="text-[#939393]">2024-01-01</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-8 flex-1">
                  {/* 전화번호 */}
                  <div className="border p-6 rounded-lg">
                    <div className="text-1.375 font-semibold mb-4">
                      전화번호
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F9F9F9] p-4 rounded-[0.25rem] font-0.75 min-w-[12rem] h-[3.5rem]"
                        >
                          <div className="w-full">
                            <div className="flex justify-between">
                              <div className="text-[#939393] font-500 pb-2">
                                관악구
                              </div>
                              <Image
                                src="/svg/copy.svg"
                                alt="copy"
                                width={12}
                                height={12}
                              />
                            </div>
                            <div className="font-700">010-0000-0000</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 계좌번호 */}
                  <div className="border p-6 rounded-lg">
                    <div className="text-1.375 font-semibold mb-4">
                      계좌번호
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F9F9F9] p-4 rounded-[0.25rem] font-0.75 min-w-[12rem]"
                        >
                          <div className="w-full">
                            <div className="flex justify-between">
                              <div className="text-[#939393] font-500 pb-2">
                                관악구
                              </div>
                              <Image
                                src="/svg/copy.svg"
                                alt="copy"
                                width={10}
                                height={10}
                              />
                            </div>
                            <div className="font-700">우리 1005-103-367439</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
