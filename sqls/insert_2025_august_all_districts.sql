-- 모든 구의 8월 배너 디스플레이 기간 데이터 삽입

-- 1. 일반 구들 (송파, 관악, 용산, 서대문): 1일-15일 상반기, 16일-31일 하반기
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
WHERE rg.name IN ('송파구', '관악구', '용산구', '서대문구')
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
WHERE rg.name IN ('송파구', '관악구', '용산구', '서대문구')
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 2. 마포구 특별 처리: 5일-15일 상반기, 16일-20일 하반기
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
    '2025-08-15'::date as period_to,
    '2025년 8월' as year_month,
    'first_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '마포구'
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
    '2025-08-20'::date as period_to,
    '2025년 8월' as year_month,
    'second_half' as period
FROM region_gu rg, display_types dt
WHERE rg.name = '마포구'
  AND dt.name = 'banner_display'
ON CONFLICT (region_gu_id, display_type_id, year_month, period) 
DO NOTHING;

-- 3. 삽입된 데이터 확인
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
WHERE dt.name = 'banner_display'
  AND rgdp.year_month = '2025년 8월'
ORDER BY rg.name, rgdp.period; 