-- panel_popup_notices 테이블 인덱스 생성 (popup_width, popup_height 컬럼은 제거됨)
-- 팝업이 콘텐츠에 따라 자동으로 크기가 조절되므로 불필요한 컬럼들

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_panel_popup_notices_display_category ON public.panel_popup_notices(display_category_id);
CREATE INDEX idx_panel_popup_notices_dates ON public.panel_popup_notices(start_date, end_date);
CREATE INDEX idx_panel_popup_notices_region ON public.panel_popup_notices(region_gu_id); 