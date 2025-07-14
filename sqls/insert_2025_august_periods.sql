-- 관악구 8월 배너 디스플레이 기간 데이터 삽입
-- 먼저 필요한 ID들을 확인하고 삽입

-- 1. 관악구 ID 확인
-- SELECT id, name FROM region_gu WHERE name = '관악구';

-- 2. 배너 디스플레이 타입 ID 확인  
-- SELECT id, name FROM display_types WHERE name = 'banner_display';

-- 3. 관악구 8월 배너 디스플레이 기간 데이터 삽입
-- (위의 ID들을 실제 값으로 교체해서 사용)

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
    '2025-08-01'::date as period_from,
    '2025-08-15'::date as period_to,
    '2025년 8월' as year_month,
    'first_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '관악구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

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
    '2025-08-16'::date as period_from,
    '2025-08-31'::date as period_to,
    '2025년 8월' as year_month,
    'second_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '관악구' 
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 4. 삽입된 데이터 확인
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
WHERE rg.name = '관악구' 
  AND dt.name = 'banner_display'
  AND rgdp.year_month = '2025년 8월'
ORDER BY rgdp.period; 