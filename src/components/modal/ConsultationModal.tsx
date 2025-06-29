'use client';
import { useState } from 'react';
import ModalContainer from './ModalContainer';
import { Button } from '../button/button';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  hasResponse?: boolean;
  responseContent?: string;
  responseDate?: string;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  productName,
  hasResponse = false,
  responseContent = '',
  responseDate = '',
}: ConsultationModalProps) {
  const [consultationContent, setConsultationContent] = useState('');

  const handleSubmit = () => {
    // 문의하기 로직 구현
    console.log('Consultation content:', consultationContent);
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={`${productName} 문의하기`}
    >
      <div className="space-y-6">
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
          />
        </div>

        {/* 상담답변 섹션 */}
        <div>
          <label className="block text-1 text-gray-2 font-500 mb-2">
            상담답변
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px]">
            {hasResponse ? (
              <div>
                <div className="text-gray-700 mb-2">{responseContent}</div>
                <div className="text-sm text-gray-500">{responseDate}</div>
              </div>
            ) : (
              <div className="text-gray-3 text-0.875">
                답변을 기다리고 있습니다.
              </div>
            )}
          </div>
        </div>

        {/* 문의하기 버튼 */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            variant="filledBlack"
            className=" text-white rounded-lg hover:bg-blue-700"
          >
            문의하기
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
