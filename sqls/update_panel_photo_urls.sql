-- 각 게시대별 실제 사진 URL 업데이트
-- 현수막게시대 사진 URL 업데이트

-- 관악구 현수막게시대 사진 업데이트
UPDATE panel_info 
SET photo_url = '/images/banner-display/panel_photos/gwanak/' || panel_code || '.jpg'
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = '현수막게시대')
  AND panel_code BETWEEN 1 AND 13;

-- 마포구 현수막게시대 사진 업데이트 (multi 폴더)
UPDATE panel_info 
SET photo_url = '/images/banner-display/panel_photos/mapo/multi/' || panel_code || '.jpg'
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '마포구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = '현수막게시대')
  AND panel_code BETWEEN 1 AND 25;

-- 서대문구 현수막게시대 사진 업데이트
UPDATE panel_info 
SET photo_url = '/images/banner-display/panel_photos/seodaemun/' || panel_code || '.jpg'
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = '현수막게시대')
  AND panel_code BETWEEN 1 AND 20;

-- 송파구 현수막게시대 사진 업데이트
UPDATE panel_info 
SET photo_url = '/images/banner-display/panel_photos/songpa/' || panel_code || '.jpg'
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '송파구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = '현수막게시대')
  AND panel_code BETWEEN 1 AND 26;

-- 용산구 현수막게시대 사진 업데이트
UPDATE panel_info 
SET photo_url = '/images/banner-display/panel_photos/yongsan/' || panel_code || '.jpg'
WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '용산구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = '현수막게시대')
  AND panel_code BETWEEN 1 AND 26;

-- LED 전자게시대 사진 업데이트 (기본 LED 이미지 사용)
UPDATE panel_info 
SET photo_url = '/images/led-display.jpeg'
WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'LED 전자게시대')
  AND (photo_url IS NULL OR photo_url = '');

-- 디지털사이니지 사진 업데이트 (기본 디지털사이니지 이미지 사용)
UPDATE panel_info 
SET photo_url = '/images/digital-signage/landing.png'
WHERE display_type_id = (SELECT id FROM display_types WHERE name = '디지털사이니지')
  AND (photo_url IS NULL OR photo_url = '');

-- 업데이트 결과 확인
SELECT 
  pi.panel_code,
  pi.nickname,
  rg.name as district,
  dt.name as display_type,
  pi.photo_url,
  CASE 
    WHEN pi.photo_url IS NOT NULL AND pi.photo_url != '' THEN '사진 있음'
    ELSE '사진 없음'
  END as photo_status
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE pi.panel_status = 'active'
ORDER BY rg.name, dt.name, pi.panel_code; 