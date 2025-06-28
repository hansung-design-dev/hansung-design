-- =================================================================
-- panel_type_enum_v2 재생성 (bulletin-boardg 제거)
-- =================================================================

-- 1. 현재 enum 값들 확인
SELECT unnest(enum_range(NULL::panel_type_enum_v2)) as panel_type_values;

-- 2. 현재 사용 중인 panel_type 값들 확인
SELECT DISTINCT panel_type FROM panel_info WHERE panel_type IS NOT NULL;

-- 3. 새 enum 타입 생성 (bulletin-boardg 제외)
CREATE TYPE panel_type_enum_v2_new AS ENUM (
    'led',
    'multi-panel', 
    'lower-panel',
    'bulletin-board'
    -- 'bulletin-boardg' 제외
);

-- 4. 기존 컬럼을 새 타입으로 변경
ALTER TABLE panel_info 
ALTER COLUMN panel_type TYPE panel_type_enum_v2_new 
USING panel_type::text::panel_type_enum_v2_new;

-- 5. 기존 enum 타입 삭제
DROP TYPE panel_type_enum_v2;

-- 6. 새 enum 타입 이름 변경
ALTER TYPE panel_type_enum_v2_new RENAME TO panel_type_enum_v2;

-- 7. 최종 확인
SELECT unnest(enum_range(NULL::panel_type_enum_v2)) as panel_type_values;

SELECT 
    panel_type,
    COUNT(*) as 개수
FROM panel_info 
WHERE panel_type IS NOT NULL
GROUP BY panel_type
ORDER BY panel_type;

RAISE NOTICE 'panel_type_enum_v2 재생성 완료! bulletin-boardg 제거됨.'; 