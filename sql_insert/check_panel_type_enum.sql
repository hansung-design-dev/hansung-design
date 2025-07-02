-- panel_type_enum_v2 enum 값들 확인
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'panel_type_enum_v2'
ORDER BY e.enumsortorder;

-- 현재 panel_info 테이블의 panel_type 분포 확인
SELECT 
    panel_type,
    COUNT(*) as count
FROM panel_info 
GROUP BY panel_type
ORDER BY panel_type; 