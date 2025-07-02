-- =================================================================
-- panel_slot_usage 테이블 구조 수정
-- =================================================================

-- 1. panel_slot_usage 테이블에 banner_slot_info_id 컬럼 추가
ALTER TABLE panel_slot_usage 
ADD COLUMN IF NOT EXISTS banner_slot_info_id UUID REFERENCES banner_slot_info(id);

-- 2. panel_slot_usage 테이블에서 중복되는 가격 컬럼들 제거
ALTER TABLE panel_slot_usage 
DROP COLUMN IF EXISTS total_price,
DROP COLUMN IF EXISTS tax_price;

-- 3. 기존 데이터에 banner_slot_info_id 설정 (panel_info_id와 slot_number로 매칭)
UPDATE panel_slot_usage 
SET banner_slot_info_id = bsi.id
FROM banner_slot_info bsi
WHERE panel_slot_usage.panel_info_id = bsi.panel_info_id
  AND panel_slot_usage.slot_number = bsi.slot_number
  AND panel_slot_usage.banner_slot_info_id IS NULL;

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_banner_slot_info_id 
ON panel_slot_usage(banner_slot_info_id);

-- 5. 결과 확인
SELECT 
    'panel_slot_usage' as table_name,
    COUNT(*) as total_records,
    COUNT(banner_slot_info_id) as records_with_banner_slot_info_id
FROM panel_slot_usage
UNION ALL
SELECT 
    'banner_slot_info' as table_name,
    COUNT(*) as total_records,
    COUNT(*) as records_with_banner_slot_info_id
FROM banner_slot_info;

-- 6. 연결 상태 확인
SELECT 
    psu.id as panel_slot_usage_id,
    psu.panel_info_id,
    psu.slot_number,
    psu.banner_slot_info_id,
    bsi.id as banner_slot_info_id_check,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee,
    bsi.total_price
FROM panel_slot_usage psu
LEFT JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
LIMIT 10; 