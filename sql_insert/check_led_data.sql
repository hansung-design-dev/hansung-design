-- 1. display_types 테이블에서 led_display 확인
SELECT * FROM display_types WHERE name = 'led_display';

-- 2. panel_info 테이블에서 LED 데이터 확인
SELECT 
  pi.id,
  pi.panel_code,
  pi.nickname,
  pi.address,
  pi.panel_status,
  pi.panel_type,
  dt.name as display_type_name,
  rg.name as region_gu_name,
  rd.name as region_dong_name
FROM panel_info pi
LEFT JOIN display_types dt ON pi.display_type_id = dt.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN region_dong rd ON pi.region_dong_id = rd.id
WHERE dt.name = 'led_display' OR pi.panel_type = 'led'
ORDER BY pi.panel_code;

-- 3. 강동구의 모든 panel_info 확인
SELECT 
  pi.id,
  pi.panel_code,
  pi.nickname,
  pi.address,
  pi.panel_status,
  pi.panel_type,
  dt.name as display_type_name,
  rg.name as region_gu_name,
  rd.name as region_dong_name
FROM panel_info pi
LEFT JOIN display_types dt ON pi.display_type_id = dt.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN region_dong rd ON pi.region_dong_id = rd.id
WHERE rg.name = '강동구'
ORDER BY pi.panel_code;

-- 4. led_panel_details 테이블 확인
SELECT * FROM led_panel_details LIMIT 5;

-- 5. led_slot_info 테이블 확인
SELECT * FROM led_slot_info LIMIT 5; 