-- 전자게시대 가격표에 세부 가격 정보 추가 및 업데이트

-- 1. 새로운 컬럼 추가 (부가세만 추가, 구청수수료는 기존 tax_price 사용)
ALTER TABLE public.led_display_price_policy 
ADD COLUMN IF NOT EXISTS vat_price integer DEFAULT 0;

-- 2. 기존 데이터의 부가세와 구청수수료 계산 및 업데이트
-- 부가세는 광고료의 10%, 구청수수료는 기존 tax_price 컬럼 사용

UPDATE public.led_display_price_policy 
SET 
  vat_price = ROUND(advertising_fee * 0.1),
  tax_price = CASE 
    WHEN total_price = 561000 THEN 11000  -- 561,000원인 경우
    WHEN total_price = 363000 THEN 11000  -- 363,000원인 경우  
    WHEN total_price = 380600 THEN 6600   -- 380,600원인 경우
    ELSE 11000  -- 기본값
  END
WHERE advertising_fee > 0;

-- 3. 특정 가격대별 세부 정보 업데이트 (이미지 데이터 기반)
UPDATE public.led_display_price_policy 
SET 
  advertising_fee = 500000,
  vat_price = 50000,
  tax_price = 11000,
  total_price = 561000
WHERE total_price = 561000 AND advertising_fee != 500000;

UPDATE public.led_display_price_policy 
SET 
  advertising_fee = 320000,
  vat_price = 32000,
  tax_price = 11000,
  total_price = 363000
WHERE total_price = 363000 AND advertising_fee != 320000;

UPDATE public.led_display_price_policy 
SET 
  advertising_fee = 340000,
  vat_price = 34000,
  tax_price = 6600,
  total_price = 380600
WHERE total_price = 380600 AND advertising_fee != 340000;

-- 4. 데이터 확인
SELECT 
  id,
  panel_id,
  advertising_fee,
  vat_price,
  tax_price,
  total_price,
  (advertising_fee + vat_price + tax_price) as calculated_total
FROM public.led_display_price_policy 
WHERE total_price IN (561000, 363000, 380600)
ORDER BY total_price, advertising_fee;

-- 5. 총합 검증
SELECT 
  total_price,
  COUNT(*) as count,
  AVG(advertising_fee) as avg_advertising_fee,
  AVG(vat_price) as avg_vat_price,
  AVG(tax_price) as avg_tax_price
FROM public.led_display_price_policy 
WHERE total_price IN (561000, 363000, 380600)
GROUP BY total_price
ORDER BY total_price; 