-- 모든 가격 정책 확인
SELECT 
    pi.panel_code,
    pi.region_gu_id,
    bsi.slot_number,
    bsi.banner_type,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.id as price_policy_id
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
ORDER BY pi.panel_code, bsi.slot_number;

-- 중복된 가격 정책 확인
SELECT 
    banner_slot_info_id,
    price_usage_type,
    COUNT(*) as count,
    array_agg(bspp.id) as price_policy_ids
FROM banner_slot_price_policy bspp
GROUP BY banner_slot_info_id, price_usage_type
HAVING COUNT(*) > 1;

-- 특정 banner_slot_info_id의 모든 가격 정책 확인 (오류에서 나온 ID)
SELECT 
    bspp.*,
    bsi.slot_number,
    bsi.banner_type,
    pi.panel_code
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE bspp.banner_slot_info_id = '516f4d4f-c554-4b99-a18e-376c871fa4bf';

-- 서대문구의 region_gu_id 확인
SELECT DISTINCT region_gu_id, panel_code FROM panel_info WHERE panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24'); 