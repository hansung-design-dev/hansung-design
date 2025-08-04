-- 🎯 강북구, 동작구에 LED display type 설정

-- 1. 현재 상태 확인
SELECT 
  '업데이트 전 상태' as check_type,
  name as district_name,
  display_type_id,
  is_active
FROM region_gu
WHERE name IN ('강북구', '동작구')
ORDER BY name;

-- 2. 강북구, 동작구에 LED display type 설정
UPDATE region_gu 
SET 
  display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9',  -- LED display type ID
  is_active = 'true',
  updated_at = NOW()
WHERE name IN ('강북구', '동작구');

-- 3. 업데이트 후 상태 확인
SELECT 
  '업데이트 후 상태' as check_type,
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

-- 4. LED display type이 설정된 모든 구들 확인
SELECT 
  'LED Display 설정된 모든 구들' as check_type,
  name as district_name,
  is_active
FROM region_gu
WHERE display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
ORDER BY name; 