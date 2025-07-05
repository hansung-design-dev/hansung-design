-- 용산구 현수막게시대 슬롯 정보 확인
SELECT 
    pi.id as panel_info_id,
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    pi.max_banner,
    bsi.slot_number,
    bsi.banner_type,
    bsi.total_price,
    bsi.max_width,
    bsi.max_height,
    bsi.slot_name,
    bsi.price_unit
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '용산구')
  AND pi.panel_type = 'panel'
ORDER BY pi.panel_code, bsi.slot_number; 