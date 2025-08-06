import { useState, useRef } from 'react';
import { Button } from '../button/button';

interface UploadResponseData {
  success: boolean;
  data?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  };
  error?: string;
}

interface AIGuidelineUploadProps {
  district: string;
  guidelineType: string;
  onUploadSuccess?: (data: UploadResponseData) => void;
  onUploadError?: (error: string) => void;
}

export default function AIGuidelineUpload({
  district,
  guidelineType,
  onUploadSuccess,
  onUploadError,
}: AIGuidelineUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      onUploadError?.('파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('district', district);
      formData.append('guidelineType', guidelineType);

      const response = await fetch('/api/upload-ai-guideline', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess?.(result.data);
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        onUploadError?.(result.error || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          AI 가이드라인 파일 업로드
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {district} - {guidelineType} 가이드라인
        </p>
      </div>

      {/* 파일 선택 */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ai,.psd,.pdf,.eps,.svg,.indd"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {fileName && (
          <div className="flex items-center justify-between p-2 bg-white border rounded">
            <span className="text-sm text-gray-700">{fileName}</span>
            <button
              onClick={handleClearFile}
              className="text-red-500 hover:text-red-700"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 지원 파일 형식 안내 */}
      <div className="text-xs text-gray-500">
        <p className="font-semibold mb-1">지원 파일 형식:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Adobe Illustrator (.ai)</li>
          <li>Adobe Photoshop (.psd)</li>
          <li>PDF (.pdf)</li>
          <li>EPS (.eps)</li>
          <li>SVG (.svg)</li>
          <li>Adobe InDesign (.indd)</li>
        </ul>
        <p className="mt-2">최대 파일 크기: 50MB</p>
      </div>

      {/* 업로드 버튼 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="filledBlack"
          onClick={handleUpload}
          disabled={!fileName || uploading}
        >
          {uploading ? '업로드 중...' : '업로드'}
        </Button>

        {fileName && (
          <Button
            size="sm"
            variant="outlinedBlack"
            onClick={handleClearFile}
            disabled={uploading}
          >
            취소
          </Button>
        )}
      </div>
    </div>
  );
}
