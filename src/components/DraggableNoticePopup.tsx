'use client';

import { useState, useEffect, useRef } from 'react';
import { PopupNotice, PopupNoticeContent } from '@/src/types/popup-notice';

// 타입 정의
interface ChecklistItem {
  text: string;
  highlighted?: string[];
  subItems?: string[];
}

interface HighlightItem {
  text: string;
  color?: string;
  bold?: boolean;
}

interface PopupSection {
  type: 'checklist' | 'highlight' | 'button' | 'divider' | 'text';
  content:
    | { items: ChecklistItem[] }
    | { highlights: HighlightItem[] }
    | { text: string; url?: string; style?: string }
    | { height?: number; color?: string }
    | string;
}

interface DraggableNoticePopupProps {
  notice: PopupNotice;
  onClose: () => void;
}

export default function DraggableNoticePopup({
  notice,
  onClose,
}: DraggableNoticePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 팝업이 이미 닫혀있는지 확인
    const isClosed = localStorage.getItem(`popup_closed_${notice.id}`);
    const isHiddenToday = localStorage.getItem(
      `popup_hidden_today_${notice.id}`
    );

    if (isClosed || isHiddenToday) {
      return;
    }

    // 화면 중앙에 위치하도록 초기 위치 설정
    const centerX = (window.innerWidth - 500) / 2; // 기본 너비 500px
    const centerY = Math.max(50, (window.innerHeight - 400) / 2); // 최소 50px 위쪽 여백 보장
    setPosition({ x: centerX, y: centerY });

    // 애니메이션을 위한 지연
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [notice.id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleHideToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem(`popup_hidden_today_${notice.id}`, today);
    handleClose();
  };

  const handleClosePermanently = () => {
    localStorage.setItem(`popup_closed_${notice.id}`, 'true');
    handleClose();
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // 드래그 중
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && popupRef.current) {
      // 직접 DOM 조작으로 실시간 반응
      popupRef.current.style.left = `${e.clientX - dragOffset.x}px`;
      popupRef.current.style.top = `${e.clientY - dragOffset.y}px`;
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (popupRef.current) {
      // 드래그 종료 시 현재 위치를 상태에 동기화
      const rect = popupRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left,
        y: rect.top,
      });
    }
    setIsDragging(false);
  };

  // 마우스 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const renderSection = (section: PopupSection, index: number) => {
    switch (section.type) {
      case 'checklist':
        const checklistContent = section.content as { items: ChecklistItem[] };
        return (
          <div key={index} className="mb-4">
            {checklistContent.items.map(
              (item: ChecklistItem, itemIndex: number) => (
                <div key={itemIndex} className="mb-3">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1">✔</span>
                    <div className="flex-1">
                      <div className="text-gray-800">
                        {item.text
                          .split(' ')
                          .map((word: string, wordIndex: number) => {
                            const isHighlighted =
                              item.highlighted?.includes(word);
                            return (
                              <span
                                key={wordIndex}
                                className={
                                  isHighlighted
                                    ? 'text-red-500 font-semibold'
                                    : ''
                                }
                              >
                                {word}{' '}
                              </span>
                            );
                          })}
                      </div>
                      {item.subItems && (
                        <div className="ml-6 mt-1">
                          {item.subItems.map(
                            (subItem: string, subIndex: number) => (
                              <div
                                key={subIndex}
                                className="text-sm text-gray-600 mb-1"
                              >
                                • {subItem}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        );

      case 'highlight':
        const highlightContent = section.content as {
          highlights: HighlightItem[];
        };
        return (
          <div key={index} className="mb-4">
            <div className="text-gray-800">
              {highlightContent.highlights.map(
                (highlight: HighlightItem, highlightIndex: number) => (
                  <span
                    key={highlightIndex}
                    className={`${
                      highlight.color === 'red' ? 'text-red-500' : ''
                    } ${highlight.bold ? 'font-semibold' : ''}`}
                  >
                    {highlight.text}
                  </span>
                )
              )}
            </div>
          </div>
        );

      case 'button':
        const buttonContent = section.content as {
          text: string;
          url?: string;
          style?: string;
        };
        return (
          <div key={index} className="mb-4">
            <button
              className={`px-4 py-2 rounded ${
                buttonContent.style === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : buttonContent.style === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } transition-colors`}
              onClick={() => {
                if (buttonContent.url) {
                  window.open(buttonContent.url, '_blank');
                }
              }}
            >
              {buttonContent.text}
            </button>
          </div>
        );

      case 'divider':
        const dividerContent = section.content as {
          height?: number;
          color?: string;
        };
        return (
          <div
            key={index}
            className="my-4"
            style={{
              height: dividerContent.height || 1,
              backgroundColor: dividerContent.color || '#e5e7eb',
            }}
          />
        );

      default:
        const textContent = section.content as string;
        return (
          <div key={index} className="mb-4 text-gray-800">
            {textContent}
          </div>
        );
    }
  };

  if (!isVisible) {
    return null;
  }

  const content = notice.content as PopupNoticeContent;

  return (
    <div
      ref={popupRef}
      className={`fixed z-50 bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } ${isDragging ? 'cursor-move' : ''}`}
      style={{
        width: 500,
        maxWidth: '90vw',
        maxHeight: '90vh',
        left: position.x,
        top: position.y,
        transform: 'translate3d(0, 0, 0)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-4 border-b select-none cursor-move"
        style={{
          backgroundColor: content.style?.headerColor || '#8B4513',
          borderColor: content.style?.headerColor || '#8B4513',
        }}
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-lg font-semibold text-white truncate">
          {content.title}
        </h3>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 내용 */}
      <div
        className="p-4 overflow-y-auto flex-1"
        style={{ maxHeight: '60vh', minHeight: '200px' }}
      >
        {content.subtitle && (
          <div className="mb-4 text-sm text-gray-600">{content.subtitle}</div>
        )}

        {content.sections.map((section, index) =>
          renderSection(section, index)
        )}
      </div>

      {/* 푸터 */}
      {content.footer && (
        <div
          className="p-4 border-t"
          style={{
            backgroundColor: content.style?.accentColor || '#654321',
            borderColor: content.style?.accentColor || '#654321',
          }}
        >
          <div className="text-white text-center">
            {content.footer.text && (
              <div className="mb-2">{content.footer.text}</div>
            )}
            {content.footer.contact && (
              <div className="text-sm">{content.footer.contact}</div>
            )}
            {content.footer.links && (
              <div className="flex justify-center gap-4 mt-2">
                {content.footer.links.map((link, index) => (
                  <button
                    key={index}
                    className="text-white hover:text-gray-200 underline"
                    onClick={() => {
                      if (link.url) {
                        window.open(link.url, '_blank');
                      }
                    }}
                  >
                    {link.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 버튼들 */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={handleHideToday}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={handleClosePermanently}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            다시 보지 않기
          </button>
        </div>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
