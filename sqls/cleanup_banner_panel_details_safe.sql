-- =================================================================
-- 서대문구 행정용 패널 관리 (안전한 버전)
-- =================================================================

-- 1. panel_info 테이블에 notes 컬럼 추가 (없는 경우)
ALTER TABLE panel_info ADD COLUMN IF NOT EXISTS notes text;

-- 2. 서대문구 panel_code 1-16번에만 admin_panel 설정
UPDATE panel_info 
SET notes = 'admin_panel'
WHERE region_gu_id = (
    SELECT id FROM region_gu WHERE name = '서대문구'
)
AND panel_code BETWEEN 1 AND 16;

-- 3. 업데이트된 패널 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    pi.notes,
    rg.name as district_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구' 
AND pi.panel_code BETWEEN 1 AND 16
ORDER BY pi.panel_code;

-- 4. banner_panel_details 테이블 삭제 (더 이상 필요하지 않음)
DROP TABLE IF EXISTS banner_panel_details CASCADE;

-- 5. 관련 트리거도 삭제 (banner_panel_details 관련)
DROP TRIGGER IF EXISTS trigger_sync_max_banner ON banner_panel_details;
DROP FUNCTION IF EXISTS sync_max_banner_from_details();

-- 6. panel_info에서 max_banner 값이 0인 경우 기본값 1로 설정
UPDATE panel_info 
SET max_banner = 1 
WHERE max_banner IS NULL OR max_banner = 0;

-- 7. 정리 완료 확인
SELECT 
    '서대문구 행정용 패널 설정 완료' as status,
    COUNT(*) as total_panels,
    COUNT(CASE WHEN notes = 'admin_panel' THEN 1 END) as admin_panels
FROM panel_info 
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구')
AND panel_code BETWEEN 1 AND 16; 