-- =================================================================
-- 송파구 상단광고 패널들을 top-fixed로 변경 (대안 방법)
-- =================================================================

-- 1. 송파구 상단광고 패널들의 panel_type을 top-fixed로 변경
UPDATE panel_info 
SET 
    panel_type = 'top-fixed',
    max_banner = 1
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND panel_code BETWEEN 1 AND 20;

-- 2. 기존 banner_slot_info를 6개월로 변경
UPDATE banner_slot_info 
SET 
    banner_type = 'top_fixed',
    slot_name = '상단광고 6개월',
    price_unit = '6 months',
    total_price = 0,
    tax_price = 0,
    advertising_fee = 0,
    road_usage_fee = 0,
    notes = '상담문의'
WHERE panel_info_id IN (
    SELECT id FROM panel_info 
    WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
      AND panel_code BETWEEN 1 AND 20
);

-- 3. 1년 슬롯 추가 (slot_number = 2)
INSERT INTO banner_slot_info (
    id,
    panel_info_id,
    slot_number,
    slot_name,
    max_width,
    max_height,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    banner_type,
    price_unit,
    is_premium,
    panel_slot_status,
    notes
)
SELECT 
    gen_random_uuid(),
    pi.id,
    2,  -- slot_number = 2
    '상단광고 1년',
    0,
    0,
    0,
    0,
    0,
    0,
    'top_fixed',
    '1 year',
    false,
    'available',
    '상담문의'
FROM panel_info pi
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_code BETWEEN 1 AND 20
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_info bsi 
    WHERE bsi.panel_info_id = pi.id AND bsi.slot_number = 2
  );

-- 4. 3년 슬롯 추가 (slot_number = 3)
INSERT INTO banner_slot_info (
    id,
    panel_info_id,
    slot_number,
    slot_name,
    max_width,
    max_height,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    banner_type,
    price_unit,
    is_premium,
    panel_slot_status,
    notes
)
SELECT 
    gen_random_uuid(),
    pi.id,
    3,  -- slot_number = 3
    '상단광고 3년',
    0,
    0,
    0,
    0,
    0,
    0,
    'top_fixed',
    '3 years',
    false,
    'available',
    '상담문의'
FROM panel_info pi
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_code BETWEEN 1 AND 20
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_info bsi 
    WHERE bsi.panel_info_id = pi.id AND bsi.slot_number = 3
  );

-- 5. 결과 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    pi.panel_type,
    pi.max_banner,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.price_unit,
    bsi.total_price,
    bsi.notes
FROM panel_info pi
LEFT JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_type = 'top-fixed'
ORDER BY pi.panel_code, bsi.slot_number; 