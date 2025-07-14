-- 기존 기간에 대한 재고 생성
-- 이 스크립트는 이미 생성된 기간들에 대해 재고를 생성합니다.

-- 1. banner_slot_inventory 생성 (현수막게시대 - first_half, second_half 구분)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_slots,
    available_slots,
    closed_slots
)
SELECT 
    pi.id as panel_info_id,
    rgdp.id as region_gu_display_period_id,
    pi.max_banner as total_slots,
    CASE 
        WHEN rgdp.period = 'first_half' THEN 
            pi.max_banner - COALESCE(pi.first_half_closure_quantity, 0)
        ELSE 
            pi.max_banner - COALESCE(pi.second_half_closure_quantity, 0)
    END as available_slots,
    CASE 
        WHEN rgdp.period = 'first_half' THEN 
            COALESCE(pi.first_half_closure_quantity, 0)
        ELSE 
            COALESCE(pi.second_half_closure_quantity, 0)
    END as closed_slots
FROM region_gu_display_periods rgdp
JOIN display_types dt ON rgdp.display_type_id = dt.id
JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id 
    AND pi.display_type_id = rgdp.display_type_id
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
WHERE dt.name = 'banner_display'
    AND rgu.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM banner_slot_inventory bsi 
        WHERE bsi.panel_info_id = pi.id 
            AND bsi.region_gu_display_period_id = rgdp.id
    );

-- 2. top_fixed_banner_inventory 생성 (용산구, 송파구 상단광고 - banner_slot_info의 각 슬롯별로 재고 생성)
INSERT INTO top_fixed_banner_inventory (
    panel_info_id,
    region_gu_display_period_id,
    banner_slot_info_id,
    total_slots,
    available_slots,
    closed_faces
)
SELECT 
    pi.id as panel_info_id,
    rgdp.id as region_gu_display_period_id,
    bsi.id as banner_slot_info_id,
    1 as total_slots,
    1 as available_slots,
    0 as closed_faces
FROM region_gu_display_periods rgdp
JOIN display_types dt ON rgdp.display_type_id = dt.id
JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id 
    AND pi.display_type_id = rgdp.display_type_id
JOIN banner_slot_info bsi ON bsi.panel_info_id = pi.id
WHERE dt.name = 'banner_display'
    AND pi.panel_status = 'active'
    AND bsi.banner_type = 'top_fixed'
    AND bsi.panel_slot_status = 'available'
    AND pi.region_gu_id IN (
        SELECT id FROM region_gu WHERE name IN ('용산구', '송파구')
    )
    AND NOT EXISTS (
        SELECT 1 FROM top_fixed_banner_inventory tfbi 
        WHERE tfbi.panel_info_id = pi.id 
            AND tfbi.region_gu_display_period_id = rgdp.id
            AND tfbi.banner_slot_info_id = bsi.id
    );

-- 생성된 재고 현황 확인 (banner_slot_inventory)
SELECT 
    'banner_slot_inventory' as inventory_type,
    rgu.name as district,
    rgdp.year_month,
    rgdp.period,
    COUNT(bsi.id) as total_inventory_records,
    SUM(bsi.total_slots) as total_slots,
    SUM(bsi.available_slots) as total_available_slots,
    SUM(bsi.closed_slots) as total_closed_slots
FROM banner_slot_inventory bsi
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rgu ON rgdp.region_gu_id = rgu.id
GROUP BY rgu.name, rgdp.year_month, rgdp.period
ORDER BY rgu.name, rgdp.year_month, rgdp.period;

-- top_fixed_banner_inventory 현황 확인
SELECT 
    'top_fixed_banner_inventory' as inventory_type,
    rgu.name as district,
    rgdp.year_month,
    rgdp.period,
    COUNT(tfbi.id) as total_inventory_records,
    SUM(tfbi.total_slots) as total_slots,
    SUM(tfbi.available_slots) as total_available_slots,
    SUM(tfbi.closed_faces) as total_closed_faces
FROM top_fixed_banner_inventory tfbi
JOIN region_gu_display_periods rgdp ON tfbi.region_gu_display_period_id = rgdp.id
JOIN region_gu rgu ON rgdp.region_gu_id = rgu.id
GROUP BY rgu.name, rgdp.year_month, rgdp.period
ORDER BY rgu.name, rgdp.year_month, rgdp.period; 