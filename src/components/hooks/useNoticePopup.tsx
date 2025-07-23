'use client';

import { useState, useEffect } from 'react';

interface Notice {
  id: string;
  title: string;
  content: string;
  popup_width?: number;
  popup_height?: number;
  display_type?: string;
  is_popup?: boolean;
  popup_start_date?: string;
  popup_end_date?: string;
}

export function useNoticePopup(displayType: string) {
  const [popupNotice, setPopupNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopupNotice = async () => {
      try {
        const response = await fetch(
          `/api/notices?display_type=${displayType}&is_popup=true&limit=1`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.notices && data.notices.length > 0) {
            setPopupNotice(data.notices[0]);
          }
        }
      } catch (error) {
        console.error('팝업 공지사항 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopupNotice();
  }, [displayType]);

  const closePopup = () => {
    setPopupNotice(null);
  };

  return {
    popupNotice,
    isLoading,
    closePopup,
  };
}
