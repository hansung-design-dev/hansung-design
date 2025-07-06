-- =================================================================
-- banner_slot_info 테이블 제약 조건 수정
-- =================================================================

-- 1. 기존 제약 조건 삭제
ALTER TABLE banner_slot_info 
DROP CONSTRAINT IF EXISTS banner_slot_info_panel_info_id_slot_number_key;

-- 2. 새로운 제약 조건 추가 (panel_info_id + slot_number + slot_name 조합)
ALTER TABLE banner_slot_info 
ADD CONSTRAINT banner_slot_info_panel_info_id_slot_number_slot_name_key 
UNIQUE (panel_info_id, slot_number, slot_name);

-- 3. 제약 조건 확인
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'banner_slot_info' 
    AND tc.constraint_type = 'UNIQUE'; 