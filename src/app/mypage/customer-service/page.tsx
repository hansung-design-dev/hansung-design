'use client';

import { useState, useEffect } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import Image from 'next/image';
import { BankAccount, contactNumber } from '@/src/mock/contact-bank';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/src/contexts/authContext';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  status: string;
  answer?: string;
  answered_at?: string;
  created_at: string;
}

interface CustomerServiceResponse {
  success: boolean;
  inquiries: Inquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statusSummary: {
    total: number;
    pending: number;
    answered: number;
    closed: number;
  };
  error?: string;
}

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState('1:1상담');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusSummary, setStatusSummary] = useState({
    total: 0,
    pending: 0,
    answered: 0,
    closed: 0,
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const tabs = [
    // { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
    { name: '로그아웃', href: '/' },
  ];

  const itemsPerPage = 5;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchInquiries();
  }, [user, authLoading, currentPage]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/customer-service?page=${currentPage}&limit=${itemsPerPage}`
      );
      const data: CustomerServiceResponse = await response.json();

      if (data.success) {
        setInquiries(data.inquiries);
        setStatusSummary(data.statusSummary);
      } else {
        setError(data.error || '상담 내역을 불러오는데 실패했습니다.');
      }
    } catch {
      setError('상담 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return '답변준비중';
      case 'answered':
        return '답변완료';
      case 'closed':
        return '답변완료';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (authLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <MypageContainer
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div>
        <div>
          <div className="flex flex-col md:flex-row lg:items-start md:items-center lg:justify-between lg:gap-6 md:gap-2">
            <h2 className="md:text-1.75 lg:text-2.25 font-500">1:1 상담</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 주문내역 카드 */}
              <div
                className="flex items-center rounded-lg p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors "
                onClick={() => router.push('/mypage/orders')}
              >
                <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-full" />
                <div className="flex flex-col pl-4 md:pl-6">
                  <div className="lg:text-1 md:text-1 font-500 mb-2">
                    주문내역
                  </div>
                  <div className="lg:text-1.5 md:text-1.6 font-bold">
                    {statusSummary.total}건
                  </div>
                </div>
              </div>

              {/* 상담내역 카드 */}
              <div className="flex items-center rounded-lg p-2 md:p-4">
                <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-full" />
                <div className="flex flex-col pl-4 md:pl-6">
                  <div className="lg:text-1 md:text-1 font-500 mb-2">
                    상담내역
                  </div>
                  <div className="lg:text-1.5 md:text-1.6 font-bold">
                    {inquiries.length}건
                  </div>
                </div>
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

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">상담 내역을 불러오는 중...</div>
          ) : (
            <>
              <table className="">
                <tbody>
                  {inquiries.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className="border-b-solid border-b-1 border-b-black md:border-b-[3px] text-1 font-500 cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                      >
                        <td className=" py-3 md:py-4 text-center ">
                          {item.id.slice(0, 8)}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-8 border-b border-gray-200">
                          {item.title}
                        </td>
                        <td className=" py-3 md:py-4 text-center border-b border-gray-200">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 py-3 md:py-4 text-end font-semibold border-b border-gray-200">
                          <div className="flex items-center justify-end gap-4">
                            <span
                              className={
                                item.status === 'answered'
                                  ? 'text-[#1C9133]'
                                  : 'text-gray-2'
                              }
                            >
                              {getStatusDisplay(item.status)}
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
                              <h3 className="font-bold">{item.title}</h3>
                              <div>
                                <p className="text-gray-500">{item.content}</p>
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
                                  <div>
                                    <p>{item.answer}</p>
                                    {item.answered_at && (
                                      <p className="text-sm text-gray-500 mt-2">
                                        답변일: {formatDate(item.answered_at)}
                                      </p>
                                    )}
                                  </div>
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
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              <div className="flex justify-center items-center mt-4 gap-2 md:gap-4 pb-[2rem]">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm md:text-1.25 font-500 border-none disabled:opacity-50"
                >
                  이전
                </button>
                <span className="px-2 py-1 text-sm md:text-1.25 font-500">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-2 py-1 text-sm md:text-1.25 font-500 border-none"
                >
                  다음
                </button>
              </div>
            </>
          )}
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
