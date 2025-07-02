-- =================================================================
-- 송파구 상단광고 슬롯 추가
-- =================================================================

-- 1. 송파구 상단광고 슬롯 추가 (기존 현수막 게시대에 추가)
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
    bpd.max_banners + 1,  -- 현수막 슬롯 다음 번호
    '상단광고 6개월',
    0,  -- 크기 정보 없음
    0,
    0,  -- 가격 0 (상담문의)
    0,
    0,
    0,
    'top_fixed',
    '6 months',
    false,
    'available',
    '상담문의'
FROM panel_info pi
JOIN banner_panel_details bpd ON pi.id = bpd.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_type = 'bulletin-board';  -- 현수막 게시대만

-- 2. 상단광고 1년 슬롯 추가
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
    bpd.max_banners + 2,  -- 현수막 슬롯 + 1 다음 번호
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
JOIN banner_panel_details bpd ON pi.id = bpd.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_type = 'bulletin-board';

-- 3. 상단광고 3년 슬롯 추가
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
    bpd.max_banners + 3,  -- 현수막 슬롯 + 2 다음 번호
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
JOIN banner_panel_details bpd ON pi.id = bpd.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND pi.panel_type = 'bulletin-board';

-- 4. 결과 확인
SELECT 
    pi.nickname,
    pi.address,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.price_unit,
    bsi.total_price,
    bsi.notes
FROM panel_info pi
JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND bsi.banner_type = 'top_fixed'
ORDER BY pi.nickname, bsi.slot_number; 