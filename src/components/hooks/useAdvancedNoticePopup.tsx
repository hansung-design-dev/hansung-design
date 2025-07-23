'use client';

import { useState, useEffect } from 'react';
import { PopupNotice } from '@/src/types/popup-notice';

export function useAdvancedNoticePopup(
  displayTypeName?: string,
  regionGuId?: string
) {
  const [popupNotice, setPopupNotice] = useState<PopupNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopupNotice = async () => {
      try {
        setIsLoading(true);

        let displayCategoryId: string | undefined;

        // display_type_name으로 ID를 조회
        if (displayTypeName) {
          const typeResponse = await fetch(
            `/api/get-display-type-id?name=${displayTypeName}`
          );
          if (typeResponse.ok) {
            const typeData = await typeResponse.json();
            displayCategoryId = typeData.displayType?.id;
          }
        }

        // 쿼리 파라미터 구성
        const params = new URLSearchParams();
        if (displayCategoryId) {
          params.append('display_category_id', displayCategoryId);
        }
        if (regionGuId) {
          params.append('region_gu_id', regionGuId);
        }
        params.append('limit', '1');

        const response = await fetch(
          `/api/panel-popup-notices?${params.toString()}`
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
  }, [displayTypeName, regionGuId]);

  const closePopup = () => {
    setPopupNotice(null);
  };

  return {
    popupNotice,
    isLoading,
    closePopup,
  };
}
