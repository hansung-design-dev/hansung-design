-- product_group_code 확인 및 검증 쿼리

-- 1. product_group_code가 설정되지 않은 제품 확인
SELECT 
  id,
  product_code,
  title,
  product_type,
  series_name,
  product_group_code
FROM public.digital_products
WHERE product_group_code IS NULL OR product_group_code = ''
ORDER BY product_type, product_code;

-- 2. product_group_code별 제품 개수 확인
SELECT 
  product_group_code,
  COUNT(*) as product_count,
  STRING_AGG(DISTINCT product_type, ', ' ORDER BY product_type) as product_types
FROM public.digital_products
WHERE product_group_code IS NOT NULL AND product_group_code != ''
GROUP BY product_group_code
ORDER BY product_group_code;

-- 3. product_group_code별 제품 목록 확인
SELECT 
  product_group_code,
  product_code,
  title,
  series_name,
  model_name
FROM public.digital_products
WHERE product_group_code IS NOT NULL AND product_group_code != ''
ORDER BY product_group_code, product_code;

-- 4. 로컬 데이터와 매핑 확인 (digitalSignageData 키 목록)
-- 필요한 product_group_code 값들:
-- - samsung-single
-- - lg-single
-- - samsung-multivision
-- - multivision-cismate
-- - digital-frame
-- - samsung-electronic-board
-- - stand-signage
-- - the-gallery
-- - q-series-stand
-- - q-series-touch
-- - bracket
-- - outdoor-wall
-- - outdoor-stand
-- - led-display
-- - led-controller
-- - led-installation
-- - kiosk

-- 5. 누락된 product_group_code 확인
SELECT 
  product_code,
  title,
  product_type,
  CASE 
    WHEN product_code LIKE 'samsung-single%' OR product_code LIKE 'samsung-qh-%' OR product_code LIKE 'samsung-qm-%' OR product_code LIKE 'samsung-qb-%' THEN 'samsung-single'
    WHEN product_code LIKE 'lg-%' THEN 'lg-single'
    WHEN product_code LIKE 'multivision-%' OR product_code LIKE 'vw550%' THEN 'multivision-cismate'
    WHEN product_code LIKE 'samsung-multivision%' THEN 'samsung-multivision'
    WHEN product_code LIKE 'the-gallery%' THEN 'the-gallery'
    WHEN product_code LIKE 'q-series-stand%' THEN 'q-series-stand'
    WHEN product_code LIKE 'q-series-touch%' THEN 'q-series-touch'
    WHEN product_code LIKE 'digital-frame%' THEN 'digital-frame'
    WHEN product_code LIKE 'samsung-board%' OR product_code LIKE 'samsung-electronic-board%' THEN 'samsung-electronic-board'
    WHEN product_code LIKE 'stand-signage%' THEN 'stand-signage'
    WHEN product_code LIKE 'bracket%' THEN 'bracket'
    WHEN product_code LIKE 'outdoor-wall%' THEN 'outdoor-wall'
    WHEN product_code LIKE 'outdoor-stand%' THEN 'outdoor-stand'
    WHEN product_code LIKE 'led-display%' THEN 'led-display'
    WHEN product_code LIKE 'led-controller%' THEN 'led-controller'
    WHEN product_code LIKE 'led-installation%' THEN 'led-installation'
    WHEN product_code LIKE '%kiosk%' THEN 'kiosk'
    ELSE 'UNKNOWN'
  END as suggested_group_code
FROM public.digital_products
WHERE product_group_code IS NULL OR product_group_code = ''
ORDER BY suggested_group_code, product_code;
