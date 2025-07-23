CREATE TABLE public.panel_popup_notices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_category_id uuid,
  title text,
  hide_oneday boolean DEFAULT false,
  content json,
  image_url text,
  start_date date,
  end_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  region_gu_id uuid,
  notice_categories_id uuid,
  CONSTRAINT panel_popup_notices_pkey PRIMARY KEY (id),
  CONSTRAINT panel_popup_notices_display_category_id_fkey FOREIGN KEY (display_category_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_popup_notices_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);


-- 기존 공지사항들을 일반 공지사항으로 설정
UPDATE public.homepage_notice 
SET display_type = 'banner_display', 
    is_popup = false 
WHERE display_type IS NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_homepage_notice_display_type ON public.homepage_notice(display_type);
CREATE INDEX idx_homepage_notice_is_popup ON public.homepage_notice(is_popup);
CREATE INDEX idx_homepage_notice_popup_dates ON public.homepage_notice(popup_start_date, popup_end_date); 