'use client';

import { useState } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import Image from 'next/image';
import { BankAccount, contactNumber } from '@/src/mock/contact-bank';
import { useRouter } from 'next/navigation';

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState('1:1상담');
  const [openItemId, setOpenItemId] = useState<number | null>(null);

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
    questionTitle: '디자인 파일로 전달 드렸는데요!',
    months: '1개월',
    phone: '010-000-0000',
    designOption: 'file',
    details: '내용을 입력해주세요.',
    answer: idx % 2 === 0 ? '유선상으로 전달드렸습니다. 감사합니다.' : null,
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

  const toggleItem = (id: number) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  const router = useRouter();

  return (
    <MypageContainer
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="mb-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row lg:items-start md:items-center lg:justify-between lg:gap-6 md:gap-2">
            <h2 className="md:text-1.75 lg:text-2.25 font-500">1:1 상담</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 주문내역 카드 */}
              {[
                { label: '주문내역', count: '3건' },
                { label: '송출중 광고', count: '2건' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-lg p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/mypage/orders')}
                >
                  <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-full" />
                  <div className="flex flex-col pl-4 md:pl-6">
                    <div className="lg:text-1 md:text-1 font-medium mb-2">
                      {item.label}
                    </div>
                    <div className="lg:text-1.5 md:text-1.6 font-bold">
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
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
                <>
                  <tr
                    key={item.id}
                    className="last:border-none border-black border-b-[2px] md:border-b-[3px] text-sm md:text-1.25 font-500 cursor-pointer"
                    onClick={() => toggleItem(item.id)}
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
                    <td className="px-4 md:pr-[2rem] py-3 md:py-4 text-end font-semibold border-b border-gray-200">
                      <div className="flex items-center justify-end gap-4">
                        <span
                          className={
                            item.status === '답변완료'
                              ? 'text-[#1C9133]'
                              : 'text-black'
                          }
                        >
                          {item.status}
                        </span>
                        <Image
                          src={
                            openItemId === item.id
                              ? '/svg/arrow-down.svg'
                              : '/svg/arrow-up.svg'
                          }
                          alt="toggle arrow"
                          width={20}
                          height={20}
                        />
                      </div>
                    </td>
                  </tr>
                  {openItemId === item.id && (
                    <tr>
                      <td colSpan={4}>
                        {/* 질문 내용 */}
                        <div className="bg-[#F9F9F9] p-6 flex flex-col gap-4">
                          <h3 className="font-bold">{item.questionTitle}</h3>
                          <div className="flex items-center gap-8">
                            <span>원하는 개월수: {item.months}</span>
                            <span>전화번호: {item.phone}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>디자인유무:</span>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`design-${item.id}`}
                                value="file"
                                checked={item.designOption === 'file'}
                                readOnly
                                className="accent-black"
                              />
                              파일로 전달
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`design-${item.id}`}
                                value="request"
                                checked={item.designOption === 'request'}
                                readOnly
                                className="accent-black"
                              />
                              디자인 요청
                            </label>
                          </div>
                          <div>
                            <p className="text-gray-500">{item.details}</p>
                          </div>
                        </div>
                        {/* 답변 내용 */}
                        <div className="bg-[#F4F4F4] p-6 flex flex-col gap-4 items-start">
                          <Image
                            src="/svg/answer.svg"
                            alt="answer icon"
                            width={24}
                            height={24}
                          />
                          <div>
                            {item.answer ? (
                              <p>{item.answer}</p>
                            ) : (
                              <p className="text-gray-500">
                                아직 답변이 없습니다.
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pt-[2rem] md:pt-[3rem]">
          {/* 자주 묻는 질문 */}
          <div className="flex flex-col gap-4 md:gap-8 lg:w-[25rem] md:w-[25rem] border rounded-lg flex-shrink-0 md:mr-4">
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

          <div className="flex flex-col gap-4 md:gap-8 w-full md:flex-1 md:pt-10">
            {/* 전화번호 */}
            <div>
              <div className="lg:text-1.375 md:text-1.125 font-semibold mb-4">
                전화번호
              </div>
              <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-3 md:gap-4">
                {contactNumber.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F9F9F9] lg:p-4 md:p-4 rounded-[0.25rem] lg:text-0.875 md:font-0.75 lg:min-w-[9rem] md:min-w-[10rem] lg:h-[2.7rem] md:h-[3.5rem] sm:w-[7rem] sm:min-w-[9rem] sm:p-2"
                  >
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex justify-between">
                        <div className="text-[#939393] font-500 pb-1 md:pb-2">
                          {item.region_gu}
                        </div>
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={12}
                          height={12}
                        />
                      </div>
                      <div className="font-700">{item.number}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 계좌번호 */}
            <div>
              <div className="lg:text-1.375 md:text-1.125  font-semibold mb-4">
                계좌번호
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {BankAccount.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F9F9F9] p-3 md:p-4 rounded-[0.25rem] text-sm md:font-0.75 lg:min-w-[11rem] md:min-w-[12rem] h-[3rem] md:h-[3.5rem] sm:w-[7rem] sm:min-w-[9rem] sm:p-2"
                  >
                    <div className="w-full">
                      <div className="flex justify-between">
                        <div className="text-[#939393] font-500 pb-1 md:pb-2">
                          {item.region_gu}
                        </div>
                        <Image
                          src="/svg/copy.svg"
                          alt="copy"
                          width={10}
                          height={10}
                        />
                      </div>
                      <div className="font-700">
                        {item.bank_name} {item.bank_account}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MypageContainer>
  );
}
