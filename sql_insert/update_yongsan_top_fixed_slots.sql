-- 기존 용산구 상단광고 banner_slot_info 삭제
DELETE FROM banner_slot_info 
WHERE panel_info_id IN (
    SELECT pi.id 
    FROM panel_info pi
    WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
)
AND slot_name LIKE '상단광고%'
AND slot_number = 0;

-- 용산구 상단광고 banner_slot_info 새로 생성 (6개월, 1년, 3년 각각)
INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    purpose,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    created_at,
    updated_at
)
SELECT 
    pi.id as panel_info_id,
    0 as slot_number,  -- 상단광고는 slot_number = 0
    '상단광고 ' || period_name as slot_name,
    'top_fixed'::banner_type as banner_type,
    'commercial' as purpose,  -- 상단광고는 상업용으로 통일
    0 as total_price,  -- 가격은 0으로 설정
    0 as tax_price,
    0 as advertising_fee,
    0 as road_usage_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
CROSS JOIN (
    VALUES 
        ('6개월'),
        ('1년'),
        ('3년')
) AS periods(period_name)
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND pi.panel_code BETWEEN 1 AND 19
ORDER BY pi.panel_code, period_name;

-- 업데이트 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    pi.nickname,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.purpose,
    bsi.period,
    bsi.half_period,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND bsi.slot_number = 0  -- 상단광고만
  AND bsi.slot_name LIKE '상단광고%'
ORDER BY pi.panel_code, bsi.period; 