-- 송파구 banner_type 수정 (올바른 버전)
-- banner_slot_info.banner_type: 'top-fixed' → 'panel' (상단광고 → 현수막광고)
-- price_unit이 '15 days'인 것들은 'panel'로 유지

-- 1. 먼저 현재 상황 확인
SELECT 
    '현재 banner_slot_info 상황' as table_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.slot_number,
    bsi.price_unit,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
ORDER BY pi.panel_code, bsi.slot_number;

-- 2. banner_slot_info의 banner_type을 'top_fixed'로 변경 (panel이면서 15 days가 아닌 것들만)
UPDATE banner_slot_info 
SET banner_type = 'top_fixed'
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE rg.name = '송파구' 
    AND pi.panel_type = 'panel'
    AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
)
AND banner_type = 'panel'
AND price_unit != '15 days'::price_unit_enum;

-- 3. 수정 후 결과 확인
SELECT 
    '수정 후 banner_slot_info' as table_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.slot_number,
    bsi.price_unit,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
ORDER BY pi.panel_code, bsi.slot_number;

-- 4. 최종 요약
SELECT 
    bsi.banner_type,
    COUNT(*) as slot_count,
    '송파구 배너 타입별 슬롯 수' as description
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
GROUP BY bsi.banner_type
ORDER BY bsi.banner_type; 