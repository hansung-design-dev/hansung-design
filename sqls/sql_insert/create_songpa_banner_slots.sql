-- 송파구 현수막게시대용 banner_slot_info 생성
-- 기존 panel_info를 공유하되, slot_number로 상단광고(0)와 현수막게시대(1~5)를 구분

INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    created_at,
    updated_at
)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, 5) as slot_number,  -- 일괄 5면
    generate_series(1, 5)::text || '면' as slot_name,
    'banner'::banner_type as banner_type,
    139800 as total_price,  -- 총액 일괄 139800원
    10000 as tax_price,  -- 수수료 일괄 10000원
    109230 as advertising_fee,  -- 광고대행료 일괄 109230원
    20570 as road_usage_fee,  -- 도로사용료 일괄 20570원
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5'  -- 송파구
  AND pi.panel_code BETWEEN 1 AND 20
ORDER BY pi.panel_code, slot_number;

-- 생성된 banner_slot_info 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.total_price,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5'  -- 송파구
  AND bsi.slot_number > 0  -- 현수막게시대만 (상단광고는 slot_number = 0)
ORDER BY pi.panel_code, bsi.slot_number; 