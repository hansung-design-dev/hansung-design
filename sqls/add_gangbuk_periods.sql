-- 강북구를 마포구와 같은 로직으로 추가
-- 5일-19일 상반기, 20일-다음달4일 하반기

-- 1. 강북구 2025년 8월 상반기 기간 데이터 생성 (5일-19일)
INSERT INTO region_gu_display_periods (
    display_type_id,
    region_gu_id,
    period_from,
    period_to,
    year_month,
    period
)
SELECT 
    dt.id as display_type_id,
    rg.id as region_gu_id,
    '2025-08-05'::date as period_from,
    '2025-08-19'::date as period_to,
    '2025년 8월' as year_month,
    'first_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '강북구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 2. 강북구 2025년 8월 하반기 기간 데이터 생성 (20일-9월4일)
INSERT INTO region_gu_display_periods (
    display_type_id,
    region_gu_id,
    period_from,
    period_to,
    year_month,
    period
)
SELECT 
    dt.id as display_type_id,
    rg.id as region_gu_id,
    '2025-08-20'::date as period_from,
    '2025-09-04'::date as period_to,
    '2025년 8월' as year_month,
    'second_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '강북구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 3. 강북구 2025년 9월 상반기 기간 데이터 생성 (5일-19일)
INSERT INTO region_gu_display_periods (
    display_type_id,
    region_gu_id,
    period_from,
    period_to,
    year_month,
    period
)
SELECT 
    dt.id as display_type_id,
    rg.id as region_gu_id,
    '2025-09-05'::date as period_from,
    '2025-09-19'::date as period_to,
    '2025년 9월' as year_month,
    'first_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '강북구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 4. 강북구 2025년 9월 하반기 기간 데이터 생성 (20일-10월4일)
INSERT INTO region_gu_display_periods (
    display_type_id,
    region_gu_id,
    period_from,
    period_to,
    year_month,
    period
)
SELECT 
    dt.id as display_type_id,
    rg.id as region_gu_id,
    '2025-09-20'::date as period_from,
    '2025-10-04'::date as period_to,
    '2025년 9월' as year_month,
    'second_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '강북구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 5. 삽입된 데이터 확인
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
WHERE rg.name = '강북구' 
  AND dt.name = 'banner_display'
ORDER BY rgdp.year_month, rgdp.period; 