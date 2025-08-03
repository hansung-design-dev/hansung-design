-- 강북구 번동을 region_dong 테이블에 추가
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
);

-- 추가된 데이터 확인
SELECT 
  rd.id,
  rd.name as dong_name,
  rd.district_code,
  rg.name as gu_name
FROM region_dong rd
JOIN region_gu rg ON rd.region_gu_id = rg.id
WHERE rd.name = '번동' AND rd.district_code = 'gangbuk'; 