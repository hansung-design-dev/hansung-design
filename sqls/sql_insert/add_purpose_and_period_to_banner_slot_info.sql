-- banner_slot_info 테이블에 용도, 기간, 반기 컬럼 추가
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS purpose VARCHAR(20) DEFAULT 'commercial';
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS period VARCHAR(20) DEFAULT '6months';
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS half_period VARCHAR(20) DEFAULT 'first';

-- 기존 데이터 업데이트
UPDATE banner_slot_info SET purpose = 'commercial' WHERE purpose IS NULL;
UPDATE banner_slot_info SET period = '6months' WHERE period IS NULL;
UPDATE banner_slot_info SET half_period = 'first' WHERE half_period IS NULL;

-- 컬럼 추가 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'banner_slot_info' 
  AND column_name IN ('purpose', 'period', 'half_period')
ORDER BY column_name; 