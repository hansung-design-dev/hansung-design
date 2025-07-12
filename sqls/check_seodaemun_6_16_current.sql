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