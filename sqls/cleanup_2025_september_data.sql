-- 2025년 9월 테스트 데이터 정리
-- 이 스크립트는 2025년 9월 테스트 데이터를 삭제합니다.

-- 1. region_gu_display_periods 테이블에서 2025년 9월 데이터 삭제
DELETE FROM region_gu_display_periods 
WHERE year_month = '2025년 9월';

-- 2. 관련 주문 데이터도 삭제 (2025년 9월과 관련된 주문들)
DELETE FROM order_details 
WHERE display_start_date >= '2025-09-01' 
  AND display_start_date < '2025-10-01';

-- 3. 관련 주문들 삭제
DELETE FROM orders 
WHERE created_at >= '2025-09-01' 
  AND created_at < '2025-10-01';

-- 4. 캐시 테이블 업데이트
-- banner_display_cache 업데이트
SELECT update_banner_display_cache();

-- led_display_cache 업데이트 (있다면)
SELECT update_led_display_cache();

-- 삭제된 데이터 확인
SELECT 
    'region_gu_display_periods' as table_name,
    COUNT(*) as remaining_2025_september_records
FROM region_gu_display_periods 
WHERE year_month = '2025년 9월'

UNION ALL

SELECT 
    'orders' as table_name,
    COUNT(*) as remaining_2025_september_records
FROM orders 
WHERE created_at >= '2025-09-01' 
  AND created_at < '2025-10-01'

UNION ALL

SELECT 
    'order_details' as table_name,
    COUNT(*) as remaining_2025_september_records
FROM order_details 
WHERE display_start_date >= '2025-09-01' 
  AND display_start_date < '2025-10-01';
