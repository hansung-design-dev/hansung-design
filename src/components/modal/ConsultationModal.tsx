'use client';
import { useState, useEffect } from 'react';
import ModalContainer from './ModalContainer';
import { Button } from '../button/button';
import { useAuth } from '@/src/contexts/authContext';
import type { CartItem } from '@/src/contexts/cartContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId?: string;
  productType?: CartItem['type'];
  consultationKey?: string;
  onSuccess?: () => void;
}

interface InquiryResponse {
  success: boolean;
  inquiry?: {
    id: string;
    title: string;
    content: string;
    status: string;
    answer_content?: string;
    answered_at?: string;
    created_at: string;
  };
  error?: string;
}

interface ExistingInquiry {
  id: string;
  title: string;
  content: string;
  status: string;
  answer?: string;
  answer_content?: string;
  answered_at?: string;
  created_at: string;
}

// 성공 모달 컴포넌트
function SuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h3 className="text-xl font-bold mb-4">상담신청 완료</h3>
          <p className="text-gray-600 mb-6">
            상담신청이 완료되었습니다.
            <br />
            해당 상품이 장바구니에서 제거되었습니다.
            <br />
            마이페이지 &gt; 1:1상담에서 진행상황을 확인해주세요.
          </p>
          <Button
            size="md"
            variant="filledBlack"
            onClick={onClose}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

// 실패 모달 컴포넌트
function ErrorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">✗</div>
          <h3 className="text-xl font-bold mb-4">문의 실패</h3>
          <p className="text-gray-600 mb-6">
            문의를 생성하는데 실패했습니다.
            <br />
            담당자에게 전화하세요.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>전화번호: 1533-0570</p>
            <p>1899-0596</p>
            <p>02-719-0083</p>
          </div>
          <Button
            size="md"
            variant="filledBlack"
            onClick={onClose}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationModal({
  isOpen,
  onClose,
  productName,
  productId,
  productType,
  consultationKey,
  onSuccess,
}: ConsultationModalProps) {
  const [consultationContent, setConsultationContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingInquiry, setExistingInquiry] =
    useState<ExistingInquiry | null>(null);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { user } = useAuth();

  const isPendingExistingInquiry = existingInquiry?.status === 'pending';

  // 모달이 열릴 때 기존 문의 확인
  useEffect(() => {
    if (isOpen && user && (consultationKey || productId || productName)) {
      checkExistingInquiry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId, productName, user, productType]);

  const checkExistingInquiry = async () => {
    try {
      // 해당 상품(디지털미디어 쇼핑몰 아이템 등)에 대해
      // 이미 상담신청한 내역이 있는지 확인
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '1');
      // consultationKey가 있으면 이것을 최우선 기준으로 사용
      if (consultationKey) {
        params.set('consultation_key', consultationKey);
      }
      // 쇼핑몰(digital-product)은 상품 코드(productId)를 기준으로 중복 여부 판단
      if (!consultationKey && productType === 'digital-product' && productId) {
        params.set('product_id', productId);
        // 과거 데이터(상품명이 저장된 상담내역)와 신규 데이터(상품코드가 저장된 상담내역)를
        // 모두 잡기 위해 상품명도 함께 전송
        if (productName) {
          params.set('product_name', productName);
        }
      } else if (productName) {
        // 그 외(현수막/LED 등)는 기존처럼 화면용 상품명을 기준으로 조회
        params.set('product_name', productName);
      } else if (productId) {
        // fallback: 최소한 productId라도 있으면 사용
        params.set('product_id', productId);
      }

      const response = await fetch(
        `/api/customer-service?${params.toString()}`
      );
      const data = await response.json();

      if (data.success && data.inquiries && data.inquiries.length > 0) {
        // 해당 상품에 대한 가장 최근 문의 찾기
        const latestInquiry = data.inquiries[0];
        setExistingInquiry(latestInquiry);
      }
    } catch {
      console.error('기존 문의 확인 실패');
    }
  };

  const handleSubmit = async () => {
    if (!consultationContent.trim()) {
      setError('상담 내용을 입력해주세요.');
      return;
    }

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    // 이미 같은 상품으로 상담신청이 접수되어 있는 경우(답변 대기중)
    // 동일 상품에 대해서는 추가 상담신청을 막고 안내 메시지만 보여준다.
    if (existingInquiry && existingInquiry.status === 'pending') {
      setError(
        '이미 이 상품으로 상담신청이 접수되어 있습니다. 다른 상품은 상담신청이 가능합니다.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/customer-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${productName} 상담문의`,
          content: consultationContent,
          // 새로운 스키마에서는 product_name 컬럼에 consultationKey를 저장
          product_name: consultationKey || productName,
          product_id: productId,
          product_type: productType,
        }),
      });

      const data: InquiryResponse = await response.json();

      if (data.success) {
        setConsultationContent('');
        setExistingInquiry(data.inquiry || null);
        if (onSuccess) {
          onSuccess();
        }
        // 성공 모달 표시
        setShowSuccessModal(true);
      } else {
        // 실패 모달 표시
        setShowErrorModal(true);
      }
    } catch {
      // 실패 모달 표시
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <ModalContainer
        isOpen={isOpen}
        onClose={onClose}
        title={`${productName} 문의하기`}
      >
        <div className="space-y-6">
          {/* 기존 문의가 있는 경우 상태 표시 */}
          {existingInquiry && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  {existingInquiry.status === 'pending'
                    ? '답변 대기중'
                    : '답변 완료'}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {existingInquiry.status === 'pending'
                  ? '이미 문의하신 내용이 있습니다. 답변을 기다리고 있습니다.'
                  : '이전 문의에 대한 답변이 완료되었습니다.'}
              </p>
            </div>
          )}

          {/* 상담내용 섹션 */}
          <div>
            <label className="block text-1 text-gray-2 font-500 mb-2">
              상담문의
            </label>
            <textarea
              value={consultationContent}
              onChange={(e) => setConsultationContent(e.target.value)}
              className={`w-full p-3 border rounded-lg min-h-[120px] resize-none ${
                isPendingExistingInquiry
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
              placeholder={
                isPendingExistingInquiry
                  ? '이미 접수된 상담에 대한 답변을 기다리는 중입니다.'
                  : '상담 내용을 입력하세요'
              }
              disabled={isPendingExistingInquiry}
            />
          </div>

          {/* 상담답변 섹션 */}
          <div>
            <label className="block text-1 text-gray-2 font-500 mb-2">
              상담답변
            </label>
            <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
              {existingInquiry?.answer_content ? (
                <div>
                  <div className="text-gray-700 mb-2">
                    {existingInquiry.answer_content}
                  </div>
                  <div className="text-sm text-gray-500">
                    {existingInquiry.answered_at &&
                      formatDate(existingInquiry.answered_at)}
                  </div>
                </div>
              ) : existingInquiry?.status === 'pending' ? (
                <div className="text-gray-500 text-0.875">
                  답변을 기다리고 있습니다.
                </div>
              ) : (
                <div className="text-gray-400 text-0.875">
                  문의하시면 답변을 드리겠습니다.
                </div>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* 문의하기 버튼 */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              size="lg"
              variant="filledBlack"
              className="text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? '전송중...' : '문의하기'}
            </Button>
          </div>
        </div>
      </ModalContainer>

      {/* 성공 모달 */}
      <SuccessModal isOpen={showSuccessModal} onClose={handleClose} />

      {/* 실패 모달 */}
      <ErrorModal isOpen={showErrorModal} onClose={handleClose} />
    </>
  );
}
