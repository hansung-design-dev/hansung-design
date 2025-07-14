-- 양방향 관계 제거 스크립트
-- order_details와 panel_slot_usage 사이의 불필요한 양방향 관계를 제거

-- 1. panel_slot_usage에서 order_details_id 컬럼 제거
-- 먼저 기존 데이터 백업
CREATE TABLE IF NOT EXISTS panel_slot_usage_backup AS 
SELECT * FROM panel_slot_usage;

-- order_details_id 컬럼 제거
ALTER TABLE panel_slot_usage DROP COLUMN IF EXISTS order_details_id;

-- 2. panel_slot_usage_order_details_id_fkey 제약조건 제거 (이미 컬럼이 삭제되면 자동으로 제거됨)

-- 3. order_details에서 panel_slot_usage_id 관계는 유지 (이것이 올바른 관계)

-- 4. 관련 트리거나 함수에서 order_details_id 참조 부분 수정이 필요할 수 있음
-- 하지만 현재 스키마에서는 order_details_id를 직접 참조하는 트리거가 없어 보임

-- 5. 확인 쿼리
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('order_details', 'panel_slot_usage')
ORDER BY tc.table_name, tc.constraint_name; 