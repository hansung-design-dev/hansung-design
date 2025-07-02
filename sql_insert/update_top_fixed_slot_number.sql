-- 용산구와 송파구의 상단광고 slot_number를 0으로 업데이트
UPDATE banner_slot_info 
SET slot_number = 0 
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    WHERE pi.region_gu_id IN (
        '01d96bb6-3056-472f-a056-2c1ea7a47db5',  -- 송파구
        '0d53c49c-4033-415b-b309-98d3fdc3d3ea'   -- 용산구
    )
    AND pi.panel_type = 'top-fixed'
)
AND slot_name LIKE '상단광고%';

-- 업데이트 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    pi.nickname,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id IN (
    '01d96bb6-3056-472f-a056-2c1ea7a47db5',  -- 송파구
    '0d53c49c-4033-415b-b309-98d3fdc3d3ea'   -- 용산구
)
AND bsi.slot_name LIKE '상단광고%'
ORDER BY pi.region_gu_id, pi.panel_code, bsi.slot_name; 