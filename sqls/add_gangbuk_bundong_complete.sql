-- 강북구 번동 추가 및 LED 게시대 업데이트 완전 스크립트

-- 1. 강북구 번동을 region_dong 테이블에 추가
INSERT INTO region_dong (
  id,
  name,
  district_code,
  region_gu_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- UUID 자동 생성
  '번동',
  'gangbuk',
  (SELECT id FROM region_gu WHERE code = 'gangbuk' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (name, district_code) DO NOTHING; -- 중복 방지

-- 2. 강북구 LED 게시대의 region_dong_id를 번동으로 업데이트
UPDATE panels 
SET 
  region_dong_id = (
    SELECT id 
    FROM region_dong 
    WHERE name = '번동' AND district_code = 'gangbuk' 
    LIMIT 1
  ),
  updated_at = NOW()
WHERE 
  region_gu_id = (SELECT id FROM region_gu WHERE code = 'gangbuk' LIMIT 1)
  AND panel_type = 'led'
  AND region_dong_id IS NULL;

-- 3. 결과 확인
SELECT 
  'region_dong 추가 결과' as check_type,
  rd.id,
  rd.name as dong_name,
  rd.district_code,
  rg.name as gu_name
FROM region_dong rd
JOIN region_gu rg ON rd.region_gu_id = rg.id
WHERE rd.name = '번동' AND rd.district_code = 'gangbuk'

UNION ALL

SELECT 
  'panels 업데이트 결과' as check_type,
  p.id,
  p.nickname,
  p.panel_code::text,
  rg.name as gu_name
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
LEFT JOIN region_dong rd ON p.region_dong_id = rd.id
WHERE rg.code = 'gangbuk' AND p.panel_type = 'led'; 