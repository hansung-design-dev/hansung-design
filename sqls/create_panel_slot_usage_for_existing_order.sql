-- =================================================================
-- 기존 주문 데이터를 기반으로 panel_slot_usage 레코드 생성
-- =================================================================

-- 1. 기존 데이터 확인
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records
FROM orders
UNION ALL
SELECT 
    'order_details' as table_name,
    COUNT(*) as total_records
FROM order_details
UNION ALL
SELECT 
    'panel_slot_usage' as table_name,
    COUNT(*) as total_records
FROM panel_slot_usage;

-- 2. 해당 패널의 banner_slot_info 확인
SELECT 
    id,
    panel_info_id,
    slot_number,
    slot_name,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    banner_type,
    price_unit
FROM banner_slot_info 
WHERE panel_info_id = '4c0bc7aa-157d-4c85-9570-2efb35f91bae'
ORDER BY slot_number;

-- 3. panel_slot_usage 레코드 생성 (첫 번째 슬롯 사용 가정)
INSERT INTO panel_slot_usage (
    id,
    panel_info_id,
    slot_number,
    banner_slot_info_id,
    usage_type,
    attach_date_from,
    is_active,
    is_closed,
    banner_type,
    order_details_id
)
SELECT 
    gen_random_uuid() as id,
    bsi.panel_info_id,
    bsi.slot_number,
    bsi.id as banner_slot_info_id,
    'banner_display' as usage_type,
    od.display_start_date as attach_date_from,
    true as is_active,
    false as is_closed,
    bsi.banner_type,
    od.id as order_details_id
FROM banner_slot_info bsi
JOIN order_details od ON bsi.panel_info_id = od.panel_info_id
WHERE od.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'
  AND bsi.slot_number = 1  -- 첫 번째 슬롯 사용
  AND od.panel_slot_usage_id IS NULL;  -- 아직 연결되지 않은 경우

-- 4. order_details의 panel_slot_usage_id 업데이트
UPDATE order_details 
SET panel_slot_usage_id = psu.id
FROM panel_slot_usage psu
WHERE order_details.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'
  AND psu.order_details_id = order_details.id
  AND order_details.panel_slot_usage_id IS NULL;

-- 5. 결과 확인
SELECT 
    od.id as order_detail_id,
    od.panel_info_id,
    od.panel_slot_usage_id,
    psu.id as panel_slot_usage_id,
    psu.banner_slot_info_id,
    bsi.total_price,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
LEFT JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
WHERE od.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'; 