-- 강북구 LED 게시대의 region_dong_id를 번동으로 업데이트
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

-- 업데이트된 데이터 확인
SELECT 
  p.id,
  p.nickname,
  p.address,
  p.panel_code,
  rg.name as gu_name,
  rd.name as dong_name
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
LEFT JOIN region_dong rd ON p.region_dong_id = rd.id
WHERE rg.code = 'gangbuk' AND p.panel_type = 'led'; 