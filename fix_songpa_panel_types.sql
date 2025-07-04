-- 송파구 banner_type 수정
-- panel_info.panel_type: 'panel' 유지 (송파구는 패널 타입)
-- banner_slot_info.banner_type: 'panel' → 'top-fixed' (상단광고로 분류)

-- 1. 먼저 현재 상황 확인
SELECT 
    'panel_info' as table_name,
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    pi.panel_status
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
ORDER BY pi.panel_code;

SELECT 
    'banner_slot_info' as table_name,
    pi.panel_code,
    pi.nickname,
    bsi.banner_type,
    bsi.slot_number,
    bsi.price_unit
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
ORDER BY pi.panel_code, bsi.slot_number;

-- 2. panel_info의 panel_type은 'panel'로 유지 (송파구는 패널 타입)
-- 이미 'panel'로 되어있으므로 변경 불필요

-- 3. banner_slot_info의 banner_type을 'top-fixed'로 변경
UPDATE banner_slot_info 
SET banner_type = 'top-fixed'
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE rg.name = '송파구' 
    AND pi.panel_type = 'panel'
    AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
);

-- 4. 수정 후 결과 확인
SELECT 
    'panel_info (송파구 패널 타입)' as table_name,
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    pi.panel_status
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
ORDER BY pi.panel_code;

SELECT 
    'banner_slot_info (송파구 상단광고)' as table_name,
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

-- 5. 최종 요약
SELECT 
    COUNT(*) as total_panels,
    '송파구 패널 타입 게시대' as description
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel';

SELECT 
    COUNT(*) as total_slots,
    '송파구 상단광고 슬롯' as description
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND bsi.banner_type = 'top-fixed'; 