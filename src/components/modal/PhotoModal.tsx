'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ArrowLeft from '@/src/icons/arrow-left.svg';
import ArrowRight from '@/src/icons/arrow-right.svg';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  currentIndex: number;
  onPhotoChange: (index: number) => void;
  currentItemName?: string;
}

export default function PhotoModal({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onPhotoChange,
  currentItemName,
}: PhotoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsLoading(true);
      onPhotoChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setIsLoading(true);
      onPhotoChange(currentIndex + 1);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen || photos.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        ></button>

        {/* 게시대 이름 */}
        {currentItemName && (
          <div className="absolute top-4 left-4 z-10 text-white text-lg font-medium">
            {currentItemName}
          </div>
        )}

        {/* 사진 정보 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white text-sm">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* 왼쪽 화살표 */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-12 h-12" />
          </button>
        )}

        {/* 오른쪽 화살표 */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowRight className="w-12 h-12" />
          </button>
        )}

        {/* 사진 */}
        <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-lg">로딩중...</div>
            </div>
          )}
          <Image
            src={photos[currentIndex]}
            alt={`게시대 사진 ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            priority
          />
        </div>
      </div>
    </div>
  );
}
