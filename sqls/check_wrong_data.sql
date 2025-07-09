-- 잘못 삽입된 데이터 확인
-- max_width = 490, max_height = 70인 데이터 찾기

SELECT 
    pi.panel_code,
    pi.region_gu_id,
    bsi.slot_number,
    bsi.banner_type,
    bsi.max_width,
    bsi.max_height,
    bsi.created_at,
    bsi.id as slot_id
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE bsi.max_width = 490 
AND bsi.max_height = 70
AND bsi.banner_type = 'panel'
ORDER BY pi.panel_code, bsi.slot_number;

-- 이 데이터들에 대한 가격 정책도 확인
SELECT 
    pi.panel_code,
    bsi.slot_number,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.id as price_id
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE bsi.max_width = 490 
AND bsi.max_height = 70
AND bsi.banner_type = 'panel'
AND bspp.total_price = 123000
ORDER BY pi.panel_code, bsi.slot_number; 