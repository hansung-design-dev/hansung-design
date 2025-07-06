-- 용산구 상단광고용 banner_slot_info 생성
-- 6개월, 1년, 3년 단위로 생성, 가격은 0으로 설정

INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    purpose,
    period,
    half_period,
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
    period_value as period,
    NULL as half_period,  -- 상단광고는 상/하반기 구분 없음
    0 as total_price,  -- 가격은 0으로 설정
    0 as tax_price,
    0 as advertising_fee,
    0 as road_usage_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
CROSS JOIN (
    VALUES 
        ('6개월', '6months'),
        ('1년', '1year'),
        ('3년', '3years')
) AS periods(period_name, period_value)
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND pi.panel_code BETWEEN 1 AND 19
ORDER BY pi.panel_code, period_value;

-- 생성된 상단광고 banner_slot_info 확인
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
ORDER BY pi.panel_code, bsi.period; 