-- 서대문구 panel_code 17-24의 기존 가격 정책 확인
SELECT 
    pi.panel_code,
    bsi.slot_number,
    bsi.banner_type,
    bspp.price_usage_type,
    bspp.total_price
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
ORDER BY pi.panel_code, bsi.slot_number;

-- 중복 확인
SELECT 
    banner_slot_info_id,
    price_usage_type,
    COUNT(*) as count
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
GROUP BY banner_slot_info_id, price_usage_type
HAVING COUNT(*) > 1;

-- banner_slot_info 개수 확인
SELECT 
    pi.panel_code,
    COUNT(bsi.id) as slot_count
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
GROUP BY pi.panel_code
ORDER BY pi.panel_code; 