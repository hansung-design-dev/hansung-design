-- 서대문구 6-16번 패널 현재 상태 확인

-- 1. 서대문구 6-16번 패널 기본 정보
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    pi.panel_status,
    pi.display_type_id,
    dt.name as display_type_name,
    rg.name as region_gu_name
FROM panel_info pi
LEFT JOIN display_types dt ON pi.display_type_id = dt.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구' AND pi.panel_code BETWEEN 6 AND 16
ORDER BY pi.panel_code;

-- 2. 서대문구 6-16번 패널의 banner_slot_info 확인
SELECT 
    pi.panel_code,
    pi.panel_type,
    bsi.id as banner_slot_info_id,
    bsi.slot_number,
    bsi.banner_type,
    bsi.max_width,
    bsi.max_height,
    bsi.panel_slot_status
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구' AND pi.panel_code BETWEEN 6 AND 16
ORDER BY pi.panel_code, bsi.slot_number;

-- 3. 서대문구 6-16번 패널의 가격정책 확인
SELECT 
    pi.panel_code,
    bsi.banner_type,
    bsi.slot_number,
    bsp.price_usage_type,
    bsp.total_price
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_info_id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구' AND pi.panel_code BETWEEN 6 AND 16
ORDER BY pi.panel_code, bsi.slot_number, bsp.price_usage_type;

-- 4. API 필터링 조건 확인
SELECT 
    pi.panel_code,
    pi.panel_type,
    pi.panel_status,
    dt.name as display_type_name,
    CASE 
        WHEN pi.panel_type IN ('with_lighting', 'no_lighting', 'semi_auto', 'panel') 
             AND pi.panel_status = 'active' 
             AND dt.name = 'banner_display'
        THEN 'PASS'
        ELSE 'FAIL'
    END as api_filter_result
FROM panel_info pi
LEFT JOIN display_types dt ON pi.display_type_id = dt.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구' AND pi.panel_code BETWEEN 6 AND 16
ORDER BY pi.panel_code; 

-- 7월 데이터 확인 쿼리
-- 현재 DB에 들어있는 region_gu_display_periods 데이터 확인

-- 1. 모든 구의 display_periods 데이터 확인
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.period_from,
    rgdp.period_to,
    rgdp.half_period,
    rgdp.year_month,
    rgdp.created_at
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
ORDER BY rg.name, dt.name, rgdp.year_month;

-- 2. 마포구의 banner_display 데이터만 확인
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.period_from,
    rgdp.period_to,
    rgdp.half_period,
    rgdp.year_month,
    rgdp.created_at
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE rg.name = '마포구' AND dt.name = 'banner_display'
ORDER BY rgdp.year_month;

-- 3. 7월 데이터만 확인 (2024-07 또는 2025-07)
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.period_from,
    rgdp.period_to,
    rgdp.half_period,
    rgdp.year_month,
    rgdp.created_at
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE rgdp.year_month LIKE '%-07'
ORDER BY rg.name, dt.name;

-- 4. 현재 날짜 기준으로 이번달 데이터 확인
SELECT 
    rg.name as district_name,
    dt.name as display_type,
    rgdp.period_from,
    rgdp.period_to,
    rgdp.half_period,
    rgdp.year_month,
    rgdp.created_at
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE rgdp.year_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
ORDER BY rg.name, dt.name; 