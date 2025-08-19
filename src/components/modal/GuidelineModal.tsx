import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '../button/button';
import ImageSkeleton from '../skeleton/ImageSkeleton';

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: string;
  guidelineType?: string;
}

interface GuidelineData {
  id: string;
  region_gu_id: string;
  guideline_image_url?: string[];
  ai_image_url?: string;
  guideline_type: string;
}

export default function GuidelineModal({
  isOpen,
  onClose,
  district,
  guidelineType = 'banner',
}: GuidelineModalProps) {
  const [guidelineData, setGuidelineData] = useState<GuidelineData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchGuideline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/panel-guideline?district=${encodeURIComponent(
          district
        )}&guideline_type=${guidelineType}`
      );

      if (!response.ok) {
        throw new Error('가이드라인을 불러올 수 없습니다.');
      }

      const result = await response.json();

      if (result.success) {
        setGuidelineData(result.data);
        // 이미지 로딩 상태 초기화
        if (result.data.guideline_image_url) {
          const initialLoadingStates: { [key: string]: boolean } = {};
          result.data.guideline_image_url.forEach((url: string) => {
            initialLoadingStates[url] = true;
          });
          setImageLoadingStates(initialLoadingStates);
        }
      } else {
        setError(result.error || '가이드라인을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '가이드라인을 불러올 수 없습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [district, guidelineType]);

  useEffect(() => {
    if (isOpen && district) {
      fetchGuideline();
    }
  }, [isOpen, district, fetchGuideline]);

  const handleImageLoad = (imageUrl: string) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [imageUrl]: false,
    }));
  };

  const handleImageStartLoad = (imageUrl: string) => {
    setImageLoadingStates((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">가이드라인</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {guidelineData && (
            <div className="space-y-6">
              {/* 가이드라인 이미지 */}
              {guidelineData.guideline_image_url &&
                guidelineData.guideline_image_url.length > 0 && (
                  <div>
                    <div className="space-y-6">
                      {guidelineData.guideline_image_url.map(
                        (imageUrl, index) => {
                          const isLoading =
                            imageLoadingStates[imageUrl] !== false;

                          return (
                            <div
                              key={`guideline-${index}`}
                              className="border rounded-lg overflow-hidden bg-gray-50"
                            >
                              <div className="max-h-[70vh] overflow-y-auto">
                                <div className="p-4">
                                  {isLoading && <ImageSkeleton />}
                                  <Image
                                    src={imageUrl}
                                    alt={`가이드라인 이미지 ${index + 1}`}
                                    width={4800}
                                    height={6000}
                                    className={`w-full h-auto ${
                                      isLoading ? 'hidden' : 'block'
                                    }`}
                                    style={{ objectFit: 'contain' }}
                                    priority={index === 0}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    placeholder="blur"
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    onLoad={() => handleImageLoad(imageUrl)}
                                    onLoadStart={() =>
                                      handleImageStartLoad(imageUrl)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t">
          <Button size="md" variant="outlinedBlack" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
