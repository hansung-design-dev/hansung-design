-- LED 게시대와 가격정책 매칭 상태 확인

-- 1. LED 게시대 패널 정보 조회
SELECT 
  'LED 게시대 패널 정보' as check_type,
  COUNT(*) as total_count
FROM public.panel_info pi
JOIN public.display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'led_display';

-- 2. LED 가격정책 데이터 조회
SELECT 
  'LED 가격정책 데이터' as check_type,
  COUNT(*) as total_count
FROM public.led_display_price_policy;

-- 3. LED 게시대 중 가격정책이 없는 패널들
SELECT 
  '가격정책이 없는 LED 게시대' as check_type,
  pi.id as panel_info_id,
  pi.nickname,
  pi.address,
  rg.name as district_name,
  dt.name as display_type_name
FROM public.panel_info pi
JOIN public.display_types dt ON pi.display_type_id = dt.id
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
LEFT JOIN public.led_display_price_policy ldpp ON pi.id = ldpp.panel_info_id
WHERE dt.name = 'led_display'
  AND ldpp.id IS NULL
ORDER BY rg.name, pi.nickname;

-- 4. 가격정책이 있지만 LED 게시대가 아닌 패널들
SELECT 
  'LED 게시대가 아닌데 가격정책이 있는 패널' as check_type,
  ldpp.id as price_policy_id,
  ldpp.panel_info_id,
  pi.nickname,
  pi.address,
  rg.name as district_name,
  dt.name as display_type_name
FROM public.led_display_price_policy ldpp
JOIN public.panel_info pi ON ldpp.panel_info_id = pi.id
JOIN public.display_types dt ON pi.display_type_id = dt.id
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
WHERE dt.name != 'led_display'
ORDER BY rg.name, pi.nickname;

-- 5. 구별 LED 게시대 가격정책 현황
SELECT 
  '구별 LED 가격정책 현황' as check_type,
  rg.name as district_name,
  COUNT(pi.id) as total_led_panels,
  COUNT(ldpp.id) as panels_with_price_policy,
  COUNT(pi.id) - COUNT(ldpp.id) as missing_price_policy,
  CASE 
    WHEN COUNT(pi.id) > 0 THEN 
      ROUND((COUNT(ldpp.id)::numeric / COUNT(pi.id)::numeric) * 100, 2)
    ELSE 0 
  END as coverage_percentage
FROM public.region_gu rg
LEFT JOIN public.panel_info pi ON rg.id = pi.region_gu_id
LEFT JOIN public.display_types dt ON pi.display_type_id = dt.id
LEFT JOIN public.led_display_price_policy ldpp ON pi.id = ldpp.panel_info_id
WHERE dt.name = 'led_display'
  AND rg.name IN ('광진구', '강동구', '동대문구', '강북구', '관악구', '동작구', '마포구')
GROUP BY rg.name
ORDER BY rg.name;

-- 6. 가격정책 상세 정보
SELECT 
  '가격정책 상세 정보' as check_type,
  rg.name as district_name,
  pi.nickname,
  pi.address,
  ldpp.advertising_fee,
  ldpp.total_price,
  ldpp.created_at,
  ldpp.updated_at
FROM public.led_display_price_policy ldpp
JOIN public.panel_info pi ON ldpp.panel_info_id = pi.id
JOIN public.display_types dt ON pi.display_type_id = dt.id
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
WHERE dt.name = 'led_display'
ORDER BY rg.name, pi.nickname;

-- 7. 구별 가격 비교 (예상 가격 vs 실제 가격)
SELECT 
  '구별 가격 비교' as check_type,
  rg.name as district_name,
  CASE rg.name
    WHEN '광진구' THEN 561000
    WHEN '강동구' THEN 561000
    WHEN '동대문구' THEN 561000
    WHEN '강북구' THEN 561000
    WHEN '관악구' THEN 363000
    WHEN '동작구' THEN 380600
    WHEN '마포구' THEN 380600
    ELSE 0
  END as expected_price,
  AVG(ldpp.total_price) as actual_avg_price,
  COUNT(*) as panel_count,
  CASE 
    WHEN AVG(ldpp.total_price) = CASE rg.name
      WHEN '광진구' THEN 561000
      WHEN '강동구' THEN 561000
      WHEN '동대문구' THEN 561000
      WHEN '강북구' THEN 561000
      WHEN '관악구' THEN 363000
      WHEN '동작구' THEN 380600
      WHEN '마포구' THEN 380600
      ELSE 0
    END THEN '정상'
    ELSE '가격 불일치'
  END as price_status
FROM public.led_display_price_policy ldpp
JOIN public.panel_info pi ON ldpp.panel_info_id = pi.id
JOIN public.display_types dt ON pi.display_type_id = dt.id
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
WHERE dt.name = 'led_display'
  AND rg.name IN ('광진구', '강동구', '동대문구', '강북구', '관악구', '동작구', '마포구')
GROUP BY rg.name
ORDER BY rg.name; 