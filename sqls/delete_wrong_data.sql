-- 잘못 삽입된 데이터만 정확히 삭제
-- panel_code 17-24의 max_width = 490, max_height = 70인 데이터

-- 1. 먼저 해당 가격 정책 삭제
DELETE FROM banner_slot_price_policy 
WHERE banner_slot_info_id IN (
    SELECT bsi.id 
    FROM banner_slot_info bsi
    JOIN panel_info pi ON bsi.panel_info_id = pi.id
    WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
    AND bsi.max_width = 490 
    AND bsi.max_height = 70
    AND bsi.banner_type = 'panel'
);

-- 2. 해당 banner_slot_info 삭제
DELETE FROM banner_slot_info 
WHERE panel_info_id IN (
    SELECT id 
    FROM panel_info 
    WHERE panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
)
AND max_width = 490 
AND max_height = 70
AND banner_type = 'panel';

-- 3. 삭제 확인
SELECT 
    'Remaining wrong data' as check_type,
    COUNT(*) as count
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.panel_code IN ('17', '18', '19', '20', '21', '22', '23', '24')
AND bsi.max_width = 490 
AND bsi.max_height = 70
AND bsi.banner_type = 'panel'; 