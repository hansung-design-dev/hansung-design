'use client';

import { useState, useRef } from 'react';
import { Button } from '@/src/components/button/button';

interface CustomFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function CustomFileUpload({
  onFileSelect,
  accept = '.pdf,.doc,.docx,.txt,.hwp,.ai,.jpg,.jpeg,.png',
  disabled = false,
  placeholder = '파일을 선택해주세요',
  className = '',
}: CustomFileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 숨겨진 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 파일명 표시 인풋 */}
      <div className="relative">
        <input
          type="text"
          value={fileName}
          placeholder={placeholder}
          readOnly
          className={`w-full px-3 py-4 border border-gray-300 rounded-sm bg-gray-50 text-gray-700 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        {fileName && !disabled && (
          <button
            onClick={handleClearFile}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* 시안업로드 버튼 */}
      <Button
        variant="outlineGray"
        onClick={handleUploadClick}
        disabled={disabled}
        className={`text-black py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-gray-400  ${
          disabled ? 'bg-gray-100  cursor-not-allowed' : ' hover:bg-gray-50'
        }`}
      >
        파일업로드
      </Button>

      {/* 파일 형식 안내 */}
      <p className="text-xs text-gray-500">
        지원 형식: PDF, Word, 텍스트, 한글, AI, JPG, JPEG, PNG
      </p>
    </div>
  );
}
