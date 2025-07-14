-- 현수막게시대 가격정책 데이터 (수정본 - 각 구별 대표 패널만 선택)

-- 가격 정책 데이터 삽입
-- 각 구별로 하나의 대표 패널만 선택하여 가격정책 생성

-------------------
--관악구 (하나의 대표 패널만 선택)
-------------------
-- 관악구 상업용 (대표 패널 하나만 선택)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 재사용 (대표 패널 하나만 선택)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 자체제작 (대표 패널 하나만 선택)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-----------------------
-- 송파구 (하나의 대표 패널만 선택)
------------------------
-- 송파구 상업용 (대표 패널 하나만 선택)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 송파구 행정용 (대표 패널 하나만 선택)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-------------------
-- 서대문구 (패널 타입별로 대표 패널 선택)
-------------------
-- 서대문구 상업용 (panel 타입 대표 패널)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 판넬 행정용 (panel 타입 대표 패널)
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
  AND pi.panel_type = 'panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 반자동 행정용 (semi_auto 타입 대표 패널)
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
  AND pi.panel_type = 'semi_auto'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'semi_auto'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-------------------
-- 용산구 (패널 타입별로 대표 패널 선택)
-------------------
-- 용산구 판넬 상업용 (panel, with_lighting, no_lighting 중 하나만 선택)
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
  AND pi.panel_type IN ('panel', 'with_lighting', 'no_lighting')
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type IN ('panel', 'with_lighting', 'no_lighting')
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 판넬 행정용 (panel, with_lighting, no_lighting 중 하나만 선택)
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
  AND pi.panel_type IN ('panel', 'with_lighting', 'no_lighting')
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type IN ('panel', 'with_lighting', 'no_lighting')
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 상업용 (semi_auto 타입 대표 패널)
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
  AND pi.panel_type = 'semi_auto'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'semi_auto'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 행정용 (semi_auto 타입 대표 패널)
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
  AND pi.panel_type = 'semi_auto'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'semi_auto'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-------------------
-- 마포구 (패널 타입별로 대표 패널 선택)
-------------------
-- 마포구 연립형 상업용 (multi_panel 타입 대표 패널)
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
  AND pi.panel_type = 'multi_panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'multi_panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 연립형 행정용 (multi_panel 타입 대표 패널)
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
  AND pi.panel_type = 'multi_panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'multi_panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 상업용 (lower_panel 타입 대표 패널)
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
  AND pi.panel_type = 'lower_panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'lower_panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용 (lower_panel 타입 대표 패널)
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
  AND pi.panel_type = 'lower_panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'lower_panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용자리대여 (0원) (lower_panel 타입 대표 패널)
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
  AND pi.panel_type = 'lower_panel'
  AND bsi.slot_number = 1
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND pi.id = (
    SELECT MIN(pi2.id) 
    FROM panel_info pi2 
    WHERE pi2.region_gu_id = rgu.id 
      AND pi2.panel_type = 'lower_panel'
      AND pi2.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
      AND pi2.panel_status = 'active'
  )
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 삽입 결과 확인
SELECT 
  rgu.name as 행정구,
  pi.panel_type as 패널타입,
  bsi.slot_number as 슬롯번호,
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
  AND bsi.slot_number = 1
ORDER BY rgu.name, pi.panel_type, bsp.price_usage_type; 





-- ========================================
-- 데이터 확인 및 검증 쿼리들
-- ========================================

-- 1. 전체 가격 정책 현황 (표 형태로 확인)
SELECT 
  rgu.name as 행정구,
  pi.panel_type as 패널타입,
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
ORDER BY rgu.name, pi.panel_type, bsp.price_usage_type;

-- 2. 구별 가격 정책 요약
SELECT 
  rgu.name as 행정구,
  COUNT(DISTINCT pi.panel_type) as 패널타입수,
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
  pi.panel_type as 패널타입,
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
ORDER BY rgu.name, pi.nickname, pi.panel_type;

-- 5. 0원 정책 확인 (자리대여 등)
SELECT 
  rgu.name as 행정구,
  pi.panel_type as 패널타입,
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
ORDER BY rgu.name, pi.panel_type; 