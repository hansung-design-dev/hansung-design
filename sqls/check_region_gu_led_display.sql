-- 🔍 region_gu 테이블 LED display type 설정 상태 확인

-- 1. display_types 테이블 확인
SELECT 'display_types 확인' as check_type, COUNT(*) as count FROM display_types;
SELECT name, id FROM display_types;

-- 2. region_gu 테이블 전체 현황
SELECT 
  'region_gu 전체 현황' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN display_type_id IS NOT NULL THEN 1 END) as with_display_type,
  COUNT(CASE WHEN display_type_id IS NULL THEN 1 END) as without_display_type
FROM region_gu;

-- 3. 구별 display_type_id 설정 현황
SELECT 
  name as district_name,
  display_type_id,
  is_active,
  CASE 
    WHEN display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN 'LED Display'
    WHEN display_type_id IS NOT NULL THEN 'Other Display'
    ELSE 'No Display Type'
  END as display_type_status
FROM region_gu
ORDER BY name;

-- 4. LED display type이 설정된 구들
SELECT 
  'LED Display 설정된 구들' as check_type,
  name as district_name,
  is_active
FROM region_gu
WHERE display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
ORDER BY name;

-- 5. LED display type이 설정되지 않은 구들
SELECT 
  'LED Display 설정되지 않은 구들' as check_type,
  name as district_name,
  display_type_id,
  is_active
FROM region_gu
WHERE display_type_id != '3119f6ed-81e4-4d62-b785-6a33bc7928f9' 
   OR display_type_id IS NULL
ORDER BY name;

-- 6. 강북구, 동작구 특별 확인
SELECT 
  '강북구, 동작구 상태 확인' as check_type,
  name as district_name,
  display_type_id,
  is_active,
  CASE 
    WHEN display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9' THEN 'LED Display 설정됨'
    WHEN display_type_id IS NOT NULL THEN '다른 Display Type 설정됨'
    ELSE 'Display Type 설정되지 않음'
  END as status
FROM region_gu
WHERE name IN ('강북구', '동작구')
ORDER BY name;

-- 7. panels 테이블에서 LED display 패널이 있는 구들
SELECT 
  'LED Display 패널이 있는 구들' as check_type,
  rg.name as district_name,
  COUNT(p.id) as panel_count
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
WHERE p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
GROUP BY rg.name
ORDER BY rg.name; 