'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PanelGuideline } from '@/src/types/displaydetail';

interface GuidelineSectionProps {
  guidelines: PanelGuideline[];
  districtName: string;
  isAllDistrictsView: boolean;
}

export default function GuidelineSection({
  guidelines,
  districtName,
  isAllDistrictsView,
}: GuidelineSectionProps) {
  const [downloading, setDownloading] = useState(false);

  // 이미지 다운로드 함수
  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
    }
  };

  // 모든 가이드라인 이미지 다운로드
  const downloadAllGuidelines = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < guidelines.length; i++) {
        const guideline = guidelines[i];
        if (
          guideline.guideline_image_url &&
          guideline.guideline_image_url.length > 0
        ) {
          for (let j = 0; j < guideline.guideline_image_url.length; j++) {
            const imageUrl = guideline.guideline_image_url[j];
            const fileName = `${districtName}_가이드라인_${i + 1}_${j + 1}.jpg`;
            await downloadImage(imageUrl, fileName);
            // 다운로드 간격을 두어 브라우저가 처리할 시간을 줍니다
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error('가이드라인 다운로드 실패:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (guidelines.length === 0 || isAllDistrictsView) {
    return null;
  }

  return (
    <div id="guideline-section" className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {districtName} 현수막게시대 가이드라인
        </h3>
        <button
          onClick={downloadAllGuidelines}
          disabled={downloading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              다운로드 중...
            </>
          ) : (
            <>
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              가이드라인 다운로드
            </>
          )}
        </button>
      </div>

      {guidelines.map((guideline) => (
        <div key={guideline.id} className="mb-8">
          {/* 가이드라인 이미지들 */}
          {guideline.guideline_image_url &&
            guideline.guideline_image_url.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-col gap-4">
                  {guideline.guideline_image_url.map(
                    (imageUrl: string, index: number) => (
                      <div key={index} className="w-full">
                        <Image
                          src={imageUrl}
                          alt={`가이드라인 이미지 ${index + 1}`}
                          width={4500}
                          height={4500}
                          className="w-full max-w-full"
                          style={{
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
