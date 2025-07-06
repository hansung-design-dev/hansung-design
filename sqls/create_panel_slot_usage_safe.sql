-- =================================================================
-- 안전한 방식으로 panel_slot_usage 레코드 생성
-- =================================================================

-- 1. 이미 panel_slot_usage가 존재하는지 확인
SELECT 
    od.id as order_detail_id,
    od.panel_slot_usage_id,
    psu.id as existing_panel_slot_usage_id
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.id = psu.order_details_id
WHERE od.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4';

-- 2. panel_slot_usage가 없는 경우에만 생성
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
    od.panel_info_id,
    1 as slot_number,  -- 1번 슬롯 고정
    bsi.id as banner_slot_info_id,
    'banner_display' as usage_type,
    od.display_start_date as attach_date_from,
    true as is_active,
    false as is_closed,
    bsi.banner_type::text::banner_type_enum_v2,
    od.id as order_details_id
FROM order_details od
JOIN banner_slot_info bsi ON od.panel_info_id = bsi.panel_info_id
WHERE od.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'
  AND bsi.slot_number = 1
  AND NOT EXISTS (
    -- 이미 이 order_details에 연결된 panel_slot_usage가 있는지 확인
    SELECT 1 FROM panel_slot_usage psu 
    WHERE psu.order_details_id = od.id
  );

-- 3. order_details의 panel_slot_usage_id 업데이트
UPDATE order_details 
SET panel_slot_usage_id = psu.id
FROM panel_slot_usage psu
WHERE order_details.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'
  AND psu.order_details_id = order_details.id
  AND order_details.panel_slot_usage_id IS NULL;

-- 4. 결과 확인
SELECT 
    od.id as order_detail_id,
    od.panel_info_id,
    od.panel_slot_usage_id,
    psu.id as panel_slot_usage_id,
    psu.slot_number,
    psu.banner_slot_info_id,
    bsi.total_price,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
LEFT JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
WHERE od.order_id = 'c91f6ca8-ec67-41f6-9676-673c8824c5f4'; 