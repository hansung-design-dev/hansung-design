-- banner_slot_info.banner_type을 'top_fixed' → 'top-fixed'로 변경
-- 언더스코어(_)에서 하이픈(-)으로 변경

-- 1. 먼저 현재 상황 확인
SELECT 
    '현재 banner_type 상태' as table_name,
    bsi.banner_type,
    COUNT(*) as count
FROM banner_slot_info bsi
GROUP BY bsi.banner_type
ORDER BY bsi.banner_type;

-- 2. 'top_fixed'를 'top-fixed'로 변경
UPDATE banner_slot_info 
SET banner_type = 'top-fixed'
WHERE banner_type = 'top_fixed';

-- 3. 변경 후 결과 확인
SELECT 
    '변경 후 banner_type 상태' as table_name,
    bsi.banner_type,
    COUNT(*) as count
FROM banner_slot_info bsi
GROUP BY bsi.banner_type
ORDER BY bsi.banner_type;

-- 4. 송파구, 용산구의 banner_type 확인
SELECT 
    rg.name as region_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.price_unit,
    bsi.slot_number
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name IN ('송파구', '용산구')
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY rg.name, pi.panel_code, bsi.slot_number; 