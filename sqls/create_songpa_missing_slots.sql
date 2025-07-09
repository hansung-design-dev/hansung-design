-- 송파구 panel_info_id = 0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce (max_banner = 5)에 대한 banner_slot_info 생성

-- banner_slot_info 생성
INSERT INTO banner_slot_info (panel_info_id, slot_number, banner_type, max_width, max_height, created_at, updated_at)
SELECT 
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce' as panel_info_id,
    generate_series(1, 5) as slot_number,
    'panel' as banner_type,
    490 as max_width,
    70 as max_height,
    NOW() as created_at,
    NOW() as updated_at;

-- 생성 확인
SELECT 
    pi.panel_code,
    pi.max_banner,
    COUNT(bsi.id) as created_slots
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.id = '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce'
GROUP BY pi.panel_code, pi.max_banner; 