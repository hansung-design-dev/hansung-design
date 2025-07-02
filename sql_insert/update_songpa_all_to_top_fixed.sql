-- 송파구 panel_info의 panel_type을 모두 top-fixed로 변경
UPDATE panel_info 
SET panel_type = 'top-fixed'
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5'  -- 송파구
  AND panel_code BETWEEN 1 AND 20;

-- 업데이트 확인
SELECT 
    id,
    panel_code,
    panel_type,
    nickname,
    max_banner
FROM panel_info 
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5'  -- 송파구
  AND panel_code BETWEEN 1 AND 20
ORDER BY panel_code; 