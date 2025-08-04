-- LED 전자게시대 캐시 가격 정보 중복 문제 해결

-- 캐시 업데이트 함수 수정 (가격 정보 중복 제거)
CREATE OR REPLACE FUNCTION update_led_display_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM led_display_cache; -- 기존 캐시 데이터 삭제
  
  INSERT INTO led_display_cache (
    region_gu_id, region_name, region_code, logo_image_url, district_image_url,
    phone_number, panel_count, price_summary, period_summary,
    bank_name, account_number, depositor, display_order, panel_status, last_updated
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
      (SELECT DISTINCT
        CONCAT('상업용: ', TO_CHAR(ldpp.total_price, 'FM999,999,999'), '원')
      FROM led_display_price_policy ldpp
      JOIN panels p2 ON ldpp.panel_id = p2.id
      WHERE p2.region_gu_id = rg.id
        AND ldpp.price_usage_type = 'default'
      LIMIT 1), 
      '가격 정보 없음'
    ) as price_summary,
    '상시접수' as period_summary,  -- LED는 상시접수
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
      WHEN rg.name = '동대문구' THEN 7
      WHEN rg.name = '영등포구' THEN 8
      WHEN rg.name = '도봉구' THEN 9
      WHEN rg.name = '용산구' THEN 10
      ELSE 999
    END as display_order,
    CASE 
      WHEN rg.is_active = 'maintenance' THEN 'maintenance'
      ELSE 'active'
    END as panel_status,
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
           ba.bank_name, ba.account_number, ba.depositor, rg.is_active
  ON CONFLICT (region_gu_id) DO UPDATE SET
    region_name = EXCLUDED.region_name,
    region_code = EXCLUDED.region_code,
    logo_image_url = EXCLUDED.logo_image_url,
    district_image_url = EXCLUDED.district_image_url,
    phone_number = EXCLUDED.phone_number,
    panel_count = EXCLUDED.panel_count,
    price_summary = EXCLUDED.price_summary,
    period_summary = EXCLUDED.period_summary,
    bank_name = EXCLUDED.bank_name,
    account_number = EXCLUDED.account_number,
    depositor = EXCLUDED.depositor,
    display_order = EXCLUDED.display_order,
    panel_status = EXCLUDED.panel_status,
    last_updated = NOW();
  
  RAISE NOTICE 'LED display cache updated successfully with fixed price summary';
END;
$$ LANGUAGE plpgsql;

-- 캐시 업데이트 실행
SELECT update_led_display_cache();

-- 결과 확인
SELECT 
  region_name, 
  panel_status,
  price_summary,
  display_order
FROM led_display_cache 
ORDER BY display_order; 