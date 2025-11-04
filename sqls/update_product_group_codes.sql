-- product_group_code 업데이트 SQL
-- product_code 패턴에 따라 product_group_code 설정

-- 1. Samsung Single Signage
UPDATE public.digital_products
SET product_group_code = 'samsung-single'
WHERE (product_code LIKE 'samsung-single%' OR product_code LIKE 'samsung-qh-%' OR product_code LIKE 'samsung-qm-%' OR product_code LIKE 'samsung-qb-%')
  AND (product_group_code IS NULL OR product_group_code = '');

-- 2. LG Single Signage
UPDATE public.digital_products
SET product_group_code = 'lg-single'
WHERE product_code LIKE 'lg-%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 3. Multivision (Cismate)
UPDATE public.digital_products
SET product_group_code = 'multivision-cismate'
WHERE (product_code LIKE 'multivision-%' OR product_code LIKE 'vw550%')
  AND (product_group_code IS NULL OR product_group_code = '');

-- 4. Samsung Multivision
UPDATE public.digital_products
SET product_group_code = 'samsung-multivision'
WHERE product_code LIKE 'samsung-multivision%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 5. The Gallery
UPDATE public.digital_products
SET product_group_code = 'the-gallery'
WHERE product_code LIKE 'the-gallery%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 6. Q Series Stand
UPDATE public.digital_products
SET product_group_code = 'q-series-stand'
WHERE product_code LIKE 'q-series-stand%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 7. Q Series Touch
UPDATE public.digital_products
SET product_group_code = 'q-series-touch'
WHERE product_code LIKE 'q-series-touch%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 8. Digital Frame
UPDATE public.digital_products
SET product_group_code = 'digital-frame'
WHERE product_code LIKE 'digital-frame%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 9. Samsung Electronic Board
UPDATE public.digital_products
SET product_group_code = 'samsung-electronic-board'
WHERE (product_code LIKE 'samsung-board%' OR product_code LIKE 'samsung-electronic-board%')
  AND (product_group_code IS NULL OR product_group_code = '');

-- 10. Stand Signage
UPDATE public.digital_products
SET product_group_code = 'stand-signage'
WHERE product_code LIKE 'stand-signage%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 11. Bracket
UPDATE public.digital_products
SET product_group_code = 'bracket'
WHERE product_code LIKE 'bracket%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 12. Outdoor Wall
UPDATE public.digital_products
SET product_group_code = 'outdoor-wall'
WHERE product_code LIKE 'outdoor-wall%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 13. Outdoor Stand
UPDATE public.digital_products
SET product_group_code = 'outdoor-stand'
WHERE product_code LIKE 'outdoor-stand%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 14. LED Display
UPDATE public.digital_products
SET product_group_code = 'led-display'
WHERE product_code LIKE 'led-display%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 15. LED Controller
UPDATE public.digital_products
SET product_group_code = 'led-controller'
WHERE product_code LIKE 'led-controller%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 16. LED Installation
UPDATE public.digital_products
SET product_group_code = 'led-installation'
WHERE product_code LIKE 'led-installation%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 17. Kiosk
UPDATE public.digital_products
SET product_group_code = 'kiosk'
WHERE product_code LIKE '%kiosk%'
  AND (product_group_code IS NULL OR product_group_code = '');

-- 확인 쿼리: product_group_code가 설정되지 않은 제품 확인
SELECT 
  product_code,
  title,
  product_type,
  product_group_code
FROM public.digital_products
WHERE product_group_code IS NULL OR product_group_code = ''
ORDER BY product_type, product_code;

-- 전체 product_group_code 분포 확인
SELECT 
  product_group_code,
  COUNT(*) as count,
  STRING_AGG(product_code, ', ' ORDER BY product_code) as product_codes
FROM public.digital_products
WHERE product_group_code IS NOT NULL AND product_group_code != ''
GROUP BY product_group_code
ORDER BY product_group_code;
