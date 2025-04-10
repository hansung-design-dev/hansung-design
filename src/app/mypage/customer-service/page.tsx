'use client';

import { useState } from 'react';
import Nav from '../../../components/Nav';
import MypageNav from '@/src/components/mypageNav';
import Image from 'next/image';
import Link from 'next/link';
export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState('1:1상담');

  const tabs = [
    { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const inquiries = Array.from({ length: 13 }, (_, idx) => ({
    id: idx + 1,
    text: `올림픽대교 남단사거리 앞 (남단 유수지앞)`,
    date: '2025-03-01',
    status: idx % 2 === 0 ? '답변완료' : '답변준비중',
  }));

  const totalPages = Math.ceil(inquiries.length / itemsPerPage);
  const currentItems = inquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Nav variant="default" className="bg-white" />

      <div className="flex justify-center bg-[#F1F1F1] sm:bg-white">
        <div className="container px-4 pt-[7rem] pb-[10rem] max-w-[1200px]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <MypageNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white p-4 md:p-8 rounded-lg w-full">
              <div className="flex flex-col md:flex-row items-start md:items-center sm:items-start justify-between gap-4 md:gap-8 sm:gap-4">
                <Link href="/mypage" className="md:hidden">
                  <Image
                    src="/svg/arrow-left.svg"
                    alt="orders"
                    width={20}
                    height={20}
                    className="w-[1.5rem] h-[1.5rem]"
                  />
                </Link>
                <div className="text-1.5 md:text-2.25 font-500">1:1 상담</div>
                <div className="grid grid-cols-2 gap-2 md:gap-4 w-full md:w-auto">
                  <div className="flex items-center  p-3 md:p-4 rounded-lg">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full" />
                    <div className="flex flex-col p-3 md:p-6">
                      <div className="text-sm md:text-lg font-medium mb-2 md:mb-4">
                        주문내역
                      </div>
                      <div className="text-xl md:text-3xl font-bold">3건</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 md:p-4 rounded-lg">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full" />
                    <div className="flex flex-col p-3 md:p-6">
                      <div className="text-sm md:text-lg font-medium mb-2 md:mb-4">
                        송출중 광고
                      </div>
                      <div className="text-xl md:text-3xl font-bold">2건</div>
                    </div>
                  </div>
                </div>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="2"
                viewBox="0 0 1088 2"
                fill="none"
                className="my-4"
              >
                <path d="M1088 1L1.33514e-05 1" stroke="#E0E0E0" />
              </svg>

              <div className="mt-8 md:mt-12 w-full overflow-x-auto">
                <table className="w-full min-w-[600px] md:min-w-[800px] pb-[2rem]">
                  <tbody>
                    {currentItems.map((item) => (
                      <tr
                        key={item.id}
                        className="last:border-none border-black border-b-[2px] md:border-b-[3px] text-sm md:text-1.25 font-500"
                      >
                        <td className="px-4 md:px-[2rem] py-3 md:py-4 text-center border-b border-gray-200">
                          {item.id}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-8 border-b border-gray-200">
                          {item.text}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-center border-b border-gray-200">
                          {item.date}
                        </td>
                        <td className="px-4 md:pr-[4rem] py-3 md:py-4 text-end font-semibold border-b border-gray-200">
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 페이지네이션 */}
                <div className="flex justify-center items-center mt-4 gap-2 md:gap-4 pb-[2rem]">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`px-2 py-1 text-sm md:text-1.25 font-500 border-none ${
                        currentPage === idx + 1
                          ? 'text-black'
                          : 'text-gray-400 hover:text-black'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <Image
                      src="/svg/arrow-right.svg"
                      width={13}
                      height={13}
                      alt="arrow-right"
                      className="cursor-pointer"
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  )}
                </div>
              </div>

              {/* 하단 정보 */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-[2rem] md:pt-[3rem]">
                {/* 자주 묻는 질문 */}
                <div className="flex flex-col gap-4 md:gap-8 w-full md:w-[28rem] border rounded-lg flex-shrink-0 md:mr-4">
                  <div className="text-lg md:text-1.375 font-semibold px-4 md:px-[2rem] ">
                    자주 묻는 질문
                  </div>
                  <ul className="space-y-2 md:text-0.875 text-gray-700 sm:pl-2">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between border-b border-gray-200 pb-3 md:pb-[1rem] last:border-none last:pb-0 text-sm md:text-0.875 font-500 px-4 md:px-[2rem] sm:min-w-[8rem]"
                      >
                        <span>게시글</span>
                        <span className="text-[#939393]">2024-01-01</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-4 md:gap-8 w-full md:flex-1 ">
                  {/* 전화번호 */}
                  <div className="border p-4 md:p-6 rounded-lg">
                    <div className="text-lg md:text-1.375 font-semibold mb-4">
                      전화번호
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F9F9F9] p-3 md:p-4 rounded-[0.25rem] text-sm md:font-0.75 min-w-[10rem] md:min-w-[12rem] h-[3rem] md:h-[3.5rem] sm:w-[7rem] sm:min-w-[9rem] sm:p-2"
                        >
                          <div className="w-full ">
                            <div className="flex justify-between">
                              <div className="text-[#939393] font-500 pb-1 md:pb-2">
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
                  <div className="border p-4 md:p-6 rounded-lg">
                    <div className="text-lg md:text-1.375 font-semibold mb-4">
                      계좌번호
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F9F9F9] p-3 md:p-4 rounded-[0.25rem] text-sm md:font-0.75 min-w-[10rem] md:min-w-[12rem] h-[3rem] md:h-[3.5rem] sm:w-[7rem] sm:min-w-[9rem] sm:p-2"
                        >
                          <div className="w-full">
                            <div className="flex justify-between">
                              <div className="text-[#939393] font-500 pb-1 md:pb-2">
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
