-- LED 패널 분석 및 구별 정리

-- 1. 구별 LED 패널 현황
SELECT 
    rg.name as region_name,
    pi.panel_code,
    pi.nickname,
    pi.id as panel_info_id,
    lsi.slot_width_px,
    lsi.slot_height_px,
    lsi.total_price,
    lsi.tax_price,
    lsi.advertising_fee,
    lsi.road_usage_fee,
    lsi.administrative_fee,
    COUNT(lsi.id) as current_slots
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led'
GROUP BY rg.name, pi.panel_code, pi.nickname, pi.id, lsi.slot_width_px, lsi.slot_height_px, 
         lsi.total_price, lsi.tax_price, lsi.advertising_fee, lsi.road_usage_fee, lsi.administrative_fee
ORDER BY rg.name, pi.panel_code;

-- 2. 구별 가격 패턴 분석
SELECT 
    rg.name as region_name,
    lsi.slot_width_px,
    lsi.slot_height_px,
    lsi.total_price,
    lsi.tax_price,
    lsi.advertising_fee,
    lsi.road_usage_fee,
    lsi.administrative_fee,
    COUNT(*) as panel_count
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN led_slot_info lsi ON pi.id = lsi.panel_info_id
WHERE pi.panel_type = 'led'
GROUP BY rg.name, lsi.slot_width_px, lsi.slot_height_px, lsi.total_price, lsi.tax_price, 
         lsi.advertising_fee, lsi.road_usage_fee, lsi.administrative_fee
ORDER BY rg.name, lsi.total_price; 