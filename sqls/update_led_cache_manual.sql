-- LED 전자게시대 캐시 테이블 수동 업데이트
-- 이 스크립트는 캐시 테이블에 데이터를 수동으로 업데이트합니다.

-- 1. 기존 캐시 데이터 삭제
DELETE FROM led_display_cache;

-- 2. 캐시 데이터 삽입
INSERT INTO led_display_cache (
  region_gu_id, region_name, region_code, logo_image_url, district_image_url,
  phone_number, panel_count, price_summary, period_summary,
  bank_name, account_number, depositor, display_order, last_updated
)
SELECT
  rg.id as region_gu_id,
  rg.name as region_name,
  rg.code as region_code,
  rg.logo_image_url,
  rg.image as district_image_url,
  rg.phone_number,
  COUNT(DISTINCT p.id) as panel_count,
  COALESCE(
    (SELECT STRING_AGG(
      CONCAT('상업용: ', TO_CHAR(ldpp.total_price, 'FM999,999,999'), '원'),
      ', ' ORDER BY ldpp.total_price
    )
    FROM led_display_price_policy ldpp
    JOIN panels p2 ON ldpp.panel_id = p2.id
    WHERE p2.region_gu_id = rg.id
      AND ldpp.price_usage_type = 'default'
    LIMIT 1),
    '가격 정보 없음'
  ) as price_summary,
  '상시접수' as period_summary,
  ba.bank_name,
  ba.account_number,
  ba.depositor,
  CASE
    WHEN rg.name = '강북구' THEN 1
    WHEN rg.name = '관악구' THEN 2
    WHEN rg.name = '마포구' THEN 3
    WHEN rg.name = '강동구' THEN 4
    WHEN rg.name = '광진구' THEN 5
    WHEN rg.name = '동작구' THEN 6
    ELSE 999
  END as display_order,
  NOW() as last_updated
FROM region_gu rg
LEFT JOIN panels p ON rg.id = p.region_gu_id
  AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND p.panel_status = 'active'
LEFT JOIN bank_accounts ba ON rg.id = ba.region_gu_id
  AND ba.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND rg.is_active IN ('true', 'maintenance')
GROUP BY rg.id, rg.name, rg.code, rg.logo_image_url, rg.image, rg.phone_number,
         ba.bank_name, ba.account_number, ba.depositor
ORDER BY display_order;

-- 3. 업데이트 결과 확인
SELECT 
  region_name, 
  region_code, 
  logo_image_url, 
  district_image_url,
  phone_number,
  panel_count,
  price_summary,
  bank_name,
  account_number,
  display_order
FROM led_display_cache 
ORDER BY display_order; 