-- period_type enum 생성
CREATE TYPE period_type AS ENUM ('first_half', 'second_half', 'full_month');

ALTER TABLE region_gu_display_periods 
ALTER COLUMN period TYPE period_type 
USING period::period_type;

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'region_gu_display_periods' 
AND column_name = 'period';


SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'region_gu_display_periods' 
AND column_name = 'year_month';

-- year_month 컬럼 길이를 20으로 늘리기
ALTER TABLE region_gu_display_periods 
ALTER COLUMN year_month TYPE character varying(20);

-- LED 타입 구들에 대한 2025년 8월 기간 데이터 생성
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
    '2025-08-31'::date as period_to,
    '2025-08' as year_month,
    'full_month' as period
FROM display_types dt
CROSS JOIN region_gu rg
WHERE dt.name = 'led_display'
  AND rg.name IN ('강동구', '광진구', '동작구', '동대문구','관악구')
  AND rg.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM region_gu_display_periods 
    WHERE display_type_id = dt.id
      AND region_gu_id = rg.id
      AND year_month = '2025-08'
      AND period = 'full_month'
  );


  -- 현수막 타입 구들에 대한 2025년 8월 상반기 기간 데이터 생성
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
    '2025-08' as year_month,
    'first_half' as period
FROM display_types dt
CROSS JOIN region_gu rg
WHERE dt.name = 'banner_display'
  AND rg.name NOT IN ('송파구', '용산구', '서대문구','관악구')
  AND rg.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM region_gu_display_periods 
    WHERE display_type_id = dt.id
      AND region_gu_id = rg.id
      AND year_month = '2025-08'
      AND period = 'first_half'
  );

-- 현수막 타입 구들에 대한 2025년 8월 하반기 기간 데이터 생성
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
    '2025-08' as year_month,
    'second_half' as period
FROM display_types dt
CROSS JOIN region_gu rg
WHERE dt.name = 'banner_display'
  AND rg.name NOT IN ('송파구', '용산구', '서대문구','관악구')
  AND rg.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM region_gu_display_periods 
    WHERE display_type_id = dt.id
      AND region_gu_id = rg.id
      AND year_month = '2025-08'
      AND period = 'second_half'
  );

    -- 마포구 현수막에 대한 2025년 8월 상반기 기간 데이터 생성
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
FROM display_types dt
CROSS JOIN region_gu rg
WHERE dt.name = 'banner_display'
  AND rg.name NOT IN ('마포구')
  AND rg.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM region_gu_display_periods 
    WHERE display_type_id = dt.id
      AND region_gu_id = rg.id
      AND year_month = '2025-08'
      AND period = 'first_half'
  );


  -- 마포구 현수막에 대한 2025년 8월 하반기 기간 데이터 생성
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
    '2025-08' as year_month,
    'second_half' as period
FROM display_types dt
CROSS JOIN region_gu rg
WHERE dt.name = 'banner_display'
  AND rg.name NOT IN ('마포구')
  AND rg.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM region_gu_display_periods 
    WHERE display_type_id = dt.id
      AND region_gu_id = rg.id
      AND year_month = '2025-08'
      AND period = 'second_half'
  );