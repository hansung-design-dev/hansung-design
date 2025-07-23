-- panel_popup_notices 테이블에서 popup_width, popup_height 컬럼 제거
-- 팝업이 콘텐츠에 따라 자동으로 크기가 조절되므로 불필요한 컬럼들

ALTER TABLE public.panel_popup_notices
DROP COLUMN IF EXISTS popup_width,
DROP COLUMN IF EXISTS popup_height;

-- 관련 인덱스들도 정리 (필요한 경우)
-- 기존 인덱스들은 유지 (display_category_id, dates, region_gu_id 등) 