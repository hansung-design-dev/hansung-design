-- banner_panel_details 테이블에서 불필요한 컬럼 제거
-- max_banners, panel_height, panel_width는 panel_info와 banner_slot_info에 이미 있음

-- 1. 먼저 현재 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'banner_panel_details' 
ORDER BY ordinal_position;

-- 2. 컬럼 제거
ALTER TABLE banner_panel_details 
DROP COLUMN IF EXISTS max_banners,
DROP COLUMN IF EXISTS panel_height,
DROP COLUMN IF EXISTS panel_width;

-- 3. 제거 후 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'banner_panel_details' 
ORDER BY ordinal_position;

-- 4. 남은 컬럼들:
-- - id (PK)
-- - panel_info_id (FK)
-- - is_for_admin (boolean)
-- - created_at
-- - updated_at 