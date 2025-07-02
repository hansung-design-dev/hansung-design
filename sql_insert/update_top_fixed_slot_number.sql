-- 상단광고의 slot_number를 0으로 업데이트
UPDATE panel_slot_info 
SET slot_number = 0 
WHERE slot_name LIKE '상단광고%';

-- 업데이트 확인
SELECT 
    psi.id,
    psi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    psi.slot_number,
    psi.slot_name
FROM panel_slot_info psi
JOIN panel_info pi ON psi.panel_info_id = pi.id
WHERE psi.slot_name LIKE '상단광고%'
ORDER BY pi.panel_code, psi.slot_name; 