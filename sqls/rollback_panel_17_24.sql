-- panel_code 17-24의 모든 잘못된 데이터 롤백

-- 1. 먼저 가격 정책 삭제
DELETE FROM banner_slot_price_policy 
WHERE banner_slot_info_id IN (
    SELECT bsi.id 
    FROM banner_slot_info bsi
    JOIN panel_info pi ON bsi.panel_info_id = pi.id
    WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
);

-- 2. banner_slot_info 삭제
DELETE FROM banner_slot_info 
WHERE panel_info_id IN (
    SELECT id 
    FROM panel_info 
    WHERE panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
);

-- 3. 삭제 확인
SELECT 
    pi.panel_code,
    pi.region_gu_id,
    COUNT(bsi.id) as remaining_slots,
    COUNT(bspp.id) as remaining_prices
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
LEFT JOIN banner_slot_price_policy bspp ON bsi.id = bspp.banner_slot_info_id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
GROUP BY pi.panel_code, pi.region_gu_id
ORDER BY pi.panel_code; 