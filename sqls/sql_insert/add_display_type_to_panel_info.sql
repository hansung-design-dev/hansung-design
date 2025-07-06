-- panel_info 테이블에 display_type 컬럼 추가
ALTER TABLE panel_info ADD COLUMN IF NOT EXISTS display_type VARCHAR(20) DEFAULT 'banner_display';

-- 기존 데이터 업데이트 (display_type이 없는 경우)
UPDATE panel_info SET display_type = 'banner_display' WHERE display_type IS NULL;

-- 송파구 현수막게시대는 'banner'로 설정
UPDATE panel_info SET display_type = 'banner' 
WHERE region_gu_id = 9 AND panel_type IN ('panel', 'semi_auto');

-- 확인
SELECT 
    id,
    panel_code,
    panel_type,
    display_type,
    region_gu_id,
    face_count,
    max_banner
FROM panel_info 
WHERE region_gu_id = 9
ORDER BY panel_code; 