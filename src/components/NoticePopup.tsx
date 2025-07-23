'use client';

import { useState, useEffect } from 'react';

interface NoticePopupProps {
  notice: {
    id: string;
    title: string;
    content: string;
    popup_width?: number;
    popup_height?: number;
  };
  onClose: () => void;
}

export default function NoticePopup({ notice, onClose }: NoticePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 팝업이 이미 닫혀있는지 확인
    const isClosed = localStorage.getItem(`popup_closed_${notice.id}`);
    const isHiddenToday = localStorage.getItem(
      `popup_hidden_today_${notice.id}`
    );

    if (isClosed || isHiddenToday) {
      return;
    }

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          width: notice.popup_width || 400,
          height: notice.popup_height || 300,
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {notice.title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-gray-700 whitespace-pre-wrap">
            {notice.content}
          </div>
        </div>

        {/* 푸터 */}
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
    </div>
  );
}
