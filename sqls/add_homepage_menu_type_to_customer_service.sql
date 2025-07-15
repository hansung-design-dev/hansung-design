-- customer_service 테이블에 homepage_menu_type 컬럼 추가
ALTER TABLE public.customer_service 
ADD COLUMN homepage_menu_type uuid REFERENCES public.homepage_menu_types(id);

-- 기존 데이터에 기본값 설정 (필요한 경우)
UPDATE public.customer_service 
SET homepage_menu_type = (SELECT id FROM public.homepage_menu_types WHERE name = 'banner_display' LIMIT 1)
WHERE homepage_menu_type IS NULL; 