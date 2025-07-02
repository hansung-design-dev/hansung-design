-- 송파구 panel_info의 max_banner를 현수막게시대 면 수로 업데이트
-- 상단광고는 별도로 계산되므로 max_banner는 현수막게시대 면 수만큼

UPDATE panel_info 
SET max_banner = face_count
WHERE region_gu_id = 9 AND panel_type = 'banner';

-- 업데이트 확인
SELECT 
    id,
    panel_code,
    panel_type,
    face_count,
    max_banner
FROM panel_info 
WHERE region_gu_id = 9 AND panel_type = 'banner'
ORDER BY panel_code; 