'use client';

import { useState, useEffect } from 'react';
import MypageContainer from '@/src/components/mypageContainer';
import Image from 'next/image';
import { BankAccount, contactNumber } from '@/src/mock/contact-bank';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/src/contexts/authContext';
import { Button } from '@/src/components/button/button';
import CustomerServiceSkeleton from '@/src/components/skeleton/CustomerServiceSkeleton';

interface Inquiry {
  id: string;
  title: string;
  content: string;
  status: string;
  answer?: string;
  answered_at?: string;
  created_at: string;
  product_type?: string;
  product_name?: string;
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
  const [activeTab] = useState('1:1상담');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 상담취소 관련 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSuccessModalOpen, setIsCancelSuccessModalOpen] =
    useState(false);
  const [inquiryToCancel, setInquiryToCancel] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const itemsPerPage = 5;

  // 상담취소 핸들러
  const handleCancelClick = (inquiryId: string) => {
    setInquiryToCancel(inquiryId);
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!inquiryToCancel) return;

    try {
      const response = await fetch(`/api/customer-service`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId: inquiryToCancel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCancelSuccessModalOpen(true);
        // 상담 목록 새로고침
        fetchInquiries();
        // 아코디언 닫기
        setOpenItemId(null);
      } else {
        console.error('상담 취소 실패:', data.error);
        alert('상담 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('상담 취소 중 오류:', error);
      alert('상담 취소 중 오류가 발생했습니다.');
    } finally {
      setIsCancelModalOpen(false);
      setInquiryToCancel(null);
    }
  };

  const handleCancelModalClose = () => {
    setIsCancelModalOpen(false);
    setInquiryToCancel(null);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getProductLabel = (inquiry: Inquiry) => {
    const typeMap: Record<string, string> = {
      led: 'LED 전자게시대',
      top_fixed: '상단광고',
      digital_media_product: '디지털미디어 쇼핑몰',
    };

    if (inquiry.product_type && typeMap[inquiry.product_type]) {
      return typeMap[inquiry.product_type];
    }

    if (inquiry.product_name?.startsWith('top_fixed:')) {
      return '상단광고';
    }

    if (inquiry.product_name?.startsWith('banner:')) {
      return '현수막게시대';
    }

    if (inquiry.product_name?.startsWith('digital_product:')) {
      return '디지털미디어 쇼핑몰';
    }

    return inquiry.product_name || '상품 상담';
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
    <MypageContainer activeTab={activeTab}>
      <div>
        <div>
          <div className="flex flex-col md:flex-row lg:items-start md:items-center lg:justify-between lg:gap-6 md:gap-2">
            <h2 className="md:text-1.75 lg:text-2.25 font-500">1:1 상담</h2>
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
            <CustomerServiceSkeleton />
          ) : (
            <>
                <table className="w-full">
                  <thead className="text-left">
                    <tr className="text-0.75 text-gray-500 uppercase tracking-wide">
                      <th className="text-center py-2">No</th>
                      <th className="text-center py-2">상품</th>
                      <th className="px-2 py-2 text-center">제목</th>
                      <th className="text-center py-2">작성일</th>
                      <th className="px-4 py-2 text-end">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className="border-b-solid border-b-1 border-b-black md:border-b-[3px] text-1 font-500 cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                      >
                        <td className="py-3 md:py-4 text-center">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className=" py-3 md:py-4 text-center ">
                          {getProductLabel(item)}
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
                            {/* 답변 대기 중인 상담만 취소 버튼 표시 */}
                            {item.status === 'pending' && (
                              <Button
                                variant="outlinedGray"
                                size="xs"
                                className={`text-black sm:text-0.75 rounded-full `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(item.id);
                                }}
                              >
                                취소
                              </Button>
                            )}
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
                        <td colSpan={5}>
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
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 pt-[2rem] md:pt-[3rem]">
          {/* 자주 묻는 질문 */}
          <div className="flex flex-col gap-4 md:gap-8 lg:w-[25rem] md:w-[25rem] border rounded-lg flex-shrink-0 md:mr-4 p-6">
            <div className="text-center">
              <div className="text-1.125 mb-4">궁금하신 점이 있으신가요?</div>
              <Button
                variant="filledBlack"
                size="md"
                onClick={() => router.push('/customer')}
                className="w-[18rem]"
              >
                자주묻는질문 보기
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:gap-8 w-full md:flex-1 md:pt-10">
          {/* 전화번호 */}
          <div>
            <div className="lg:text-1.375 md:text-1.125 font-semibold mb-4 pl-16">
              전화번호
            </div>
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-3 md:gap-4 justify-items-center">
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
            <div className="lg:text-1.375 md:text-1.125  font-semibold mb-4 pl-14">
              계좌번호
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 justify-items-center">
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

      {/* 상담취소 확인 모달 */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 py-10">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">상담 취소</h3>
              <p className="text-gray-600 mb-6">상담을 취소하시겠습니까?</p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="md"
                  variant="filledBlack"
                  onClick={handleCancelModalClose}
                  className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
                >
                  아니오
                </Button>
                <Button
                  size="md"
                  variant="filledBlack"
                  onClick={handleCancelConfirm}
                  className="w-[6.5rem] h-[2.5rem] text-0.875 font-200 hover:cursor-pointer"
                >
                  예
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상담취소 성공 모달 */}
      {isCancelSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-4">완료</h3>
              <p className="text-gray-600 mb-6">상담이 취소되었습니다.</p>
              <button
                onClick={() => setIsCancelSuccessModalOpen(false)}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </MypageContainer>
  );
}
