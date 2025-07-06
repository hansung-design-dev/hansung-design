-- panel_info 테이블에 panel_type 컬럼 추가
ALTER TABLE panel_info ADD COLUMN IF NOT EXISTS panel_type VARCHAR(20) DEFAULT 'panel';

-- 기존 데이터 업데이트 (panel_type이 없는 경우)
UPDATE panel_info SET panel_type = 'panel' WHERE panel_type IS NULL;

-- panel_code 11, 17, 19는 semi_auto로 설정
UPDATE panel_info SET panel_type = 'semi_auto' WHERE panel_code IN (11, 17, 19);

-- 확인
SELECT 
    id,
    panel_code,
    panel_type,
    region_gu_id,
    face_count,
    max_banner
FROM panel_info 
WHERE region_gu_id = 9
ORDER BY panel_code; 