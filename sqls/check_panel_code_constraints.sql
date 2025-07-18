-- panel_info 테이블의 panel_code 제약조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'panel_info'::regclass 
AND contype = 'c';

-- 기존 panel_code 값들 확인
SELECT 
    panel_code,
    COUNT(*) as count,
    MIN(panel_code) as min_code,
    MAX(panel_code) as max_code
FROM panel_info 
WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
GROUP BY panel_code
ORDER BY panel_code;

-- 사용 가능한 panel_code 범위 확인
SELECT 
    '현재 사용 중인 panel_code 범위' as info,
    MIN(panel_code) as min_code,
    MAX(panel_code) as max_code,
    COUNT(DISTINCT panel_code) as unique_codes
FROM panel_info 
WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display');

-- 강북구 관련 기존 데이터 확인
SELECT 
    pi.panel_code,
    pi.nickname,
    pi.panel_status,
    rgu.name as region_name
FROM panel_info pi
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '강북구'
AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display'); 