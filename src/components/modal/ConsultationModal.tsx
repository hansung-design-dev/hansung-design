'use client';
import { useState, useEffect } from 'react';
import ModalContainer from './ModalContainer';
import { Button } from '../button/button';
import { useAuth } from '@/src/contexts/authContext';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId?: string;
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

  // 모달이 열릴 때 기존 문의 확인
  useEffect(() => {
    if (isOpen && productId && user) {
      checkExistingInquiry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, productId, user]);

  const checkExistingInquiry = async () => {
    try {
      const response = await fetch(
        `/api/customer-service?product_id=${productId}`
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
          product_name: productName,
          product_id: productId,
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
              placeholder="상담 내용을 입력하세요"
              disabled={existingInquiry?.status === 'pending'}
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
              disabled={loading || existingInquiry?.status === 'pending'}
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
