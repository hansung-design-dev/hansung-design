-- 송파구 현수막게시대용 banner_slot_info 생성
-- 각 panel_info에 대해 면 수만큼 slot을 생성

INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    price,
    vat,
    design_fee,
    road_usage_fee,
    created_at,
    updated_at
)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, pi.face_count) as slot_number,
    generate_series(1, pi.face_count)::text || '면' as slot_name,
    'banner'::banner_type as banner_type,
    CASE 
        WHEN pi.panel_code = 19 THEN 120000
        ELSE 140000
    END as price,
    CASE 
        WHEN pi.panel_code = 19 THEN 12000
        ELSE 14000
    END as vat,
    CASE 
        WHEN pi.panel_code = 19 THEN 6000
        ELSE 7000
    END as design_fee,
    CASE 
        WHEN pi.panel_code = 19 THEN 6000
        ELSE 7000
    END as road_usage_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.region_gu_id = 9 
  AND pi.panel_type = 'banner'
ORDER BY pi.panel_code, slot_number;

-- 생성된 banner_slot_info 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    pi.face_count,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.price,
    bsi.vat,
    bsi.design_fee,
    bsi.road_usage_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = 9 
  AND pi.panel_type = 'banner'
ORDER BY pi.panel_code, bsi.slot_number; 