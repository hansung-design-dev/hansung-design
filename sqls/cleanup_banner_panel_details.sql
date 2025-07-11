-- =================================================================
-- banner_panel_details 테이블 정리 및 서대문구 행정용 패널 관리
-- =================================================================

-- 1. 서대문구 행정용 패널들을 panel_info.notes에 'admin_panel' 메시지 추가
UPDATE panel_info 
SET notes = CASE 
    WHEN notes IS NULL OR notes = '' THEN 'admin_panel'
    ELSE notes || '; admin_panel'
END
WHERE id IN (
    SELECT bpd.panel_info_id
    FROM banner_panel_details bpd
    JOIN panel_info pi ON bpd.panel_info_id = pi.id
    JOIN region_gu rg ON pi.region_gu_id = rg.id
    WHERE bpd.is_for_admin = true 
    AND rg.name = '서대문구'
);

-- 2. 업데이트된 패널 확인
SELECT 
    pi.id,
    pi.nickname,
    pi.notes,
    rg.name as district_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.notes LIKE '%admin_panel%'
ORDER BY rg.name, pi.nickname;

-- 3. banner_panel_details 테이블 삭제 (더 이상 필요하지 않음)
DROP TABLE IF EXISTS banner_panel_details CASCADE;

-- 4. 관련 트리거도 삭제 (banner_panel_details 관련)
DROP TRIGGER IF EXISTS trigger_sync_max_banner ON banner_panel_details;
DROP FUNCTION IF EXISTS sync_max_banner_from_details();

-- 5. panel_info에서 max_banner 값이 0인 경우 기본값 1로 설정
UPDATE panel_info 
SET max_banner = 1 
WHERE max_banner IS NULL OR max_banner = 0;

-- 6. 정리 완료 확인
SELECT 
    'banner_panel_details 테이블 정리 완료' as status,
    COUNT(*) as total_panels,
    COUNT(CASE WHEN notes LIKE '%admin_panel%' THEN 1 END) as admin_panels
FROM panel_info; 