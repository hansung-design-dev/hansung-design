-- 송파구 상단광고 banner_slot_info 데이터 정리
-- 기존 중복 데이터 삭제 후 새로 추가

-- 1. 먼저 현재 상황 확인
SELECT 
    COUNT(*) as total_slots,
    pi.panel_code,
    pi.nickname,
    pi.panel_type
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
GROUP BY pi.panel_code, pi.nickname, pi.panel_type
ORDER BY pi.panel_code;

-- 2. 송파구 상단광고의 모든 banner_slot_info 삭제
DELETE FROM banner_slot_info 
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE rg.name = '송파구' 
    AND pi.panel_type = 'top-fixed'
    AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
);

-- 3. 삭제 후 확인
SELECT 
    COUNT(*) as remaining_slots
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed';

-- 4. 송파구 상단광고 패널 목록 확인
SELECT 
    pi.id,
    pi.panel_code,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.max_banner
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top-fixed'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ORDER BY pi.panel_code; 