-- year_month 컬럼의 기본값 제거
ALTER TABLE public.region_gu_display_periods 
ALTER COLUMN year_month DROP DEFAULT;

-- 변경사항 확인
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'region_gu_display_periods' 
AND column_name = 'year_month'; 