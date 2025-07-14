-- 현수막게시대 가격정책 데이터 

-- 가격 정책 데이터 삽입
-- 기존 데이터 삭제 (선택사항)
--  banner_slot_price_policy, 가격정책은 가격만 나타내는 것이므로 각 게시대에 하나의 현수막게시대 값만 보여주면 됨. 하지만 용산구처럼 반자동과 패널(panel, with_lighting, no_lighting)으로 나뉘어 있는 경우 로우가 두개 생김
-- 관악구 - 로우 3개(상업, 재사용, 자체제작)
-- 송파구 - 로우 2개(상업, 행정)
-- 서대문구 - 로우 3개 (상업, 판넬-행정, 반자동-행정)
-- 용산구 - 로우 4개 (판넬(panel, with_lighting, no_lighting)-상업, 판넬-행정, 반자동(semi_auto)-행정, 반자동-상업)
-- 마포구 - 로우 5개 (연립-상업, 연립-행정 , 저단-상업, 저단-행정, 저단-행정용자리대여)

-- 1. 관악구 - 3개 로우
-- 상업용 (default)
-- 재사용 (reuse)
-- 자체제작 (self_install)

-- 2. 송파구 - 2개 로우
-- 상업용 (default) - panel 타입
-- 행정용 (public_institution) - panel 타입

-- 3. 서대문구 - 3개 로우
-- 상업용 (default) - panel 타입
-- 판넬-행정용 (public_institution) - panel 타입
-- 반자동-행정용 (public_institution) - semi_auto 타입

-- 4. 용산구 - 4개 로우
-- 판넬-상업용 (default) - panel, with_lighting, no_lighting 타입
-- 판넬-행정용 (public_institution) - panel, with_lighting, no_lighting 타입
-- 반자동-상업용 (default) - semi_auto 타입
-- 반자동-행정용 (public_institution) - semi_auto 타입

-- 5. 마포구 - 5개 로우
-- 연립-상업용 (default) - multi_panel 타입
-- 연립-행정용 (public_institution) - multi_panel 타입
-- 저단-상업용 (default) - lower_panel 타입
-- 저단-행정용 (public_institution) - lower_panel 타입
-- 저단-행정용자리대여 (public_institution_rental) - lower_panel 타입



-------------------
--관악구
-------------------
-- 관악구 가격 정책
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  110000,
  10000,
  33000,
  67000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND bsi.slot_name = '상업용'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 재사용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  're_order',
  78000,
  10000,
  33000,
  35000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND bsi.slot_name = '재사용'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 자체제작
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'self_install',
  78000,
  10000,
  33000,
  35000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND bsi.slot_name = '자체제작'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-----------------------
-- 송파구 
------------------------
-- 송파구 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  139800,
  10000,
  20570,
  109230
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '송파구' 
  AND bsi.slot_name = '상업용'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 송파구 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  109230,
  0,
  0,
  109230
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '송파구' 
  AND bsi.slot_name = '상업용'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();


-------------------
-- 서대문구
-------------------
-- 서대문구 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  123000,
  10000,
  22600,
  90400
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND bsi.slot_name = '상업용'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 판넬 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  85000,
  0,
  0,
  85000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND bsi.slot_name = '판넬'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 반자동 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  60000,
  0,
  0,
  60000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND bsi.slot_name = '반자동'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 판넬 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  140000,
  10000,
  27720,
  102280
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND bsi.slot_name = '판넬'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 판넬 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  99000,
  0,
  0,
  99000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND bsi.slot_name = '판넬'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  120000,
  10000,
  22100,
  87900
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND bsi.slot_name = '반자동'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  79000,
  0,
  0,
  79000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND bsi.slot_name = '반자동'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 연립형 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  130000,
  10000,
  26400,
  93600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND bsi.slot_name = '연립형'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 연립형 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  93600,
  0,
  0,
  93600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND bsi.slot_name = '연립형'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  100000,
  10000,
  26400,
  63600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND bsi.slot_name = '저단형'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  70000,
  0,
  0,
  70000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND bsi.slot_name = '저단형'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용자리대여 (0원)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'reduction_by_admin',
  0,
  0,
  0,
  0
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND bsi.slot_name = '저단형'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 삽입 결과 확인
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ORDER BY rgu.name, bsi.slot_name, bsp.price_usage_type; 





-- ========================================
-- 데이터 확인 및 검증 쿼리들
-- ========================================

-- 1. 전체 가격 정책 현황 (표 형태로 확인)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  CASE 
    WHEN bsp.price_usage_type::text = 'default' THEN '상업용'
    WHEN bsp.price_usage_type::text = 'public_institution' THEN '행정용'
    WHEN bsp.price_usage_type::text = 're_order' THEN '재사용'
    WHEN bsp.price_usage_type::text = 'self_install' THEN '자체설치'
    WHEN bsp.price_usage_type::text = 'reduction_by_admin' THEN '관리자할인'
    WHEN bsp.price_usage_type::text = 'rent-place' THEN '자리대여'
    ELSE bsp.price_usage_type::text
  END as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ORDER BY rgu.name, bsi.slot_name, bsp.price_usage_type;

-- 2. 구별 가격 정책 요약
SELECT 
  rgu.name as 행정구,
  COUNT(DISTINCT bsi.slot_name) as 패널종류수,
  COUNT(bsp.id) as 가격정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 'default' THEN 1 END) as 상업용정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 'public_institution' THEN 1 END) as 행정용정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 're_order' THEN 1 END) as 재사용정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 'self_install' THEN 1 END) as 자체설치정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 'reduction_by_admin' THEN 1 END) as 관리자할인정책수,
  COUNT(CASE WHEN bsp.price_usage_type::text = 'rent-place' THEN 1 END) as 자리대여정책수
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_info bsi ON bsi.panel_info_id = pi.id
LEFT JOIN banner_slot_price_policy bsp ON bsp.banner_slot_info_id = bsi.id
WHERE rgu.is_active = true
GROUP BY rgu.name
ORDER BY rgu.name;

-- 3. 가격 정책 타입별 통계
SELECT 
  CASE 
    WHEN bsp.price_usage_type::text = 'default' THEN '상업용'
    WHEN bsp.price_usage_type::text = 'public_institution' THEN '행정용'
    WHEN bsp.price_usage_type::text = 're_order' THEN '재사용'
    WHEN bsp.price_usage_type::text = 'self_install' THEN '자체설치'
    WHEN bsp.price_usage_type::text = 'reduction_by_admin' THEN '관리자할인'
    WHEN bsp.price_usage_type::text = 'rent-place' THEN '자리대여'
    ELSE bsp.price_usage_type::text
  END as 용도구분,
  COUNT(bsp.id) as 정책수,
  ROUND(AVG(bsp.total_price), 0) as 평균총납부액,
  ROUND(AVG(bsp.tax_price), 0) as 평균수수료,
  ROUND(AVG(bsp.road_usage_fee), 0) as 평균도로사용료,
  ROUND(AVG(bsp.advertising_fee), 0) as 평균광고대행료,
  MIN(bsp.total_price) as 최소총납부액,
  MAX(bsp.total_price) as 최대총납부액
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
GROUP BY bsp.price_usage_type
ORDER BY bsp.price_usage_type;

-- 4. 누락된 가격 정책 확인
SELECT 
  rgu.name as 행정구,
  pi.nickname as 패널명,
  bsi.slot_name as 패널종류,
  bsi.id as banner_slot_info_id,
  '가격정책 없음' as 상태
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_price_policy bsp 
    WHERE bsp.banner_slot_info_id = bsi.id
  )
ORDER BY rgu.name, pi.nickname, bsi.slot_name;

-- 5. 0원 정책 확인 (자리대여 등)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  '0원 정책' as 비고
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND bsp.total_price = 0
ORDER BY rgu.name, bsi.slot_name; 