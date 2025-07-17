-- 마포구 기간 데이터 수정
-- 현재: 8월5일-15일, 16일-9월4일
-- 수정: 8월5일-19일, 20일-9월4일

-- 1. 현재 마포구 8월 데이터 확인
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.year_month,
    rgdp.period,
    rgdp.period_from,
    rgdp.period_to
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE rg.name = '마포구' 
  AND dt.name = 'banner_display'
  AND rgdp.year_month = '2025년 8월'
ORDER BY rgdp.period;

-- 2. 마포구 8월 상반기 수정 (5일-19일)
UPDATE region_gu_display_periods 
SET period_to = '2025-08-19'::date
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '마포구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND year_month = '2025년 8월'
  AND period = 'first_half';

-- 3. 마포구 8월 하반기 수정 (20일-9월4일)
UPDATE region_gu_display_periods 
SET period_from = '2025-08-20'::date
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '마포구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND year_month = '2025년 8월'
  AND period = 'second_half';

-- 4. 수정된 데이터 확인
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.year_month,
    rgdp.period,
    rgdp.period_from,
    rgdp.period_to
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE rg.name = '마포구' 
  AND dt.name = 'banner_display'
  AND rgdp.year_month = '2025년 8월'
ORDER BY rgdp.period; 