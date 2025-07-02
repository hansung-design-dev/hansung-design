-- 송파구 panel_info의 panel_type 수정
-- panel_code 11, 17, 19는 semi_auto로 변경
UPDATE panel_info 
SET panel_type = 'semi_auto'
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5' 
  AND panel_code IN (11, 17, 19);

-- panel_code 8-10, 12-16, 18, 20은 panel로 변경 (이미 panel이지만 확실히 하기 위해)
UPDATE panel_info 
SET panel_type = 'panel'
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5' 
  AND panel_code IN (8, 9, 10, 12, 13, 14, 15, 16, 18, 20);

-- 확인
SELECT 
    id,
    panel_code,
    panel_type,
    nickname,
    max_banner
FROM panel_info 
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5'
ORDER BY panel_code; 