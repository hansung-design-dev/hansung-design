'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalContainer from './ModalContainer';
import { Button } from './button/button';

interface OrderModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModificationModal({
  isOpen,
  onClose,
}: OrderModificationModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company: '가입회원정보',
    title: '',
    managerName: '',
    businessLicense: null as File | null,
    companyName: '',
    email: '',
    phone1: '',
    phone2: '',
    phone3: '',
    designType: 'mail',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, businessLicense: file }));
    }
  };

  const handleSubmit = () => {
    // 저장 로직 구현
    console.log('Form data:', formData);
    onClose();
  };

  const handleGoToInfoPage = () => {
    onClose();
    router.push('/mypage/info');
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} title="간편정보 수정하기">
      <div className="space-y-6">
        {/* 회사 선택 드롭다운 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
            회사 선택
          </label>
          <select
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
          >
            <option className="text-gray-1" value="가입회원정보">
              가입회원정보
            </option>
            <option className="text-gray-1" value="한성디자인">
              한성디자인
            </option>
            <option className="text-gray-1" value="서울디자인">
              서울디자인
            </option>
          </select>
        </div>

        {/* 제목 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
            제목<span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 담당자명 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
            담당자명<span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={formData.managerName}
            onChange={(e) => handleInputChange('managerName', e.target.value)}
            className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
            placeholder="담당자명을 입력하세요"
          />
        </div>

        {/* 사업자등록증 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
            사업자등록증<span className="text-red">*</span>
          </label>
          <div className="relative w-[80%]">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="w-full px-3 py-2 border-solid border-1 border-gray-300 rounded-lg bg-white flex items-center justify-between">
              <span className="text-gray-500">
                {formData.businessLicense
                  ? formData.businessLicense.name
                  : '파일을 선택해주세요'}
              </span>
              <Button
                size="sm"
                className="bg-gray-2 text-white rounded text-sm hover:bg-gray-600 pointer-events-none"
              >
                파일올리기
              </Button>
            </div>
          </div>
        </div>

        {/* 회사명 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
            회사명
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
            placeholder="회사명을 입력하세요"
          />
        </div>

        {/* 이메일 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
            이메일<span className="text-red">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
            placeholder="이메일을 입력하세요"
          />
        </div>

        {/* 전화번호 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
            전화번호<span className="text-red">*</span>
          </label>
          <div className="flex gap-2 w-[80%]">
            <input
              type="text"
              value={formData.phone1}
              onChange={(e) => handleInputChange('phone1', e.target.value)}
              className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="010"
              maxLength={3}
            />
            <input
              type="text"
              value={formData.phone2}
              onChange={(e) => handleInputChange('phone2', e.target.value)}
              className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="0000"
              maxLength={4}
            />
            <input
              type="text"
              value={formData.phone3}
              onChange={(e) => handleInputChange('phone3', e.target.value)}
              className="w-[80%] px-3 py-4  border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="0000"
              maxLength={4}
            />
          </div>
        </div>

        {/* 디자인유무 */}
        <div className="flex gap-2 items-center">
          <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
            디자인유무
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="designType"
                value="mail"
                checked={formData.designType === 'mail'}
                onChange={(e) =>
                  handleInputChange('designType', e.target.value)
                }
                className="mr-2"
              />
              메일로 전달
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="designType"
                value="request"
                checked={formData.designType === 'request'}
                onChange={(e) =>
                  handleInputChange('designType', e.target.value)
                }
                className="mr-2"
              />
              디자인 요청
            </label>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            variant="filledBlack"
            className="text-white rounded-lg hover:bg-gray-2 lg:text-1 lg:font-300"
          >
            저장
          </Button>
          <Button
            onClick={handleGoToInfoPage}
            size="lg"
            variant="filledBlack"
            className="text-white rounded-lg hover:bg-gray-2 lg:text-1 lg:font-300"
          >
            간편정보 페이지 가기
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
