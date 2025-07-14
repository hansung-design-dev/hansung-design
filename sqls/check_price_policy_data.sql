-- banner_slot_price_policy 테이블 데이터 확인 쿼리들

-- 1. 전체 가격 정책 현황 (기본)
SELECT 
  rgu.name as 행정구,
  pi.nickname as 패널명,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  bsp.created_at as 생성일,
  bsp.updated_at as 수정일
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ORDER BY rgu.name, pi.nickname, bsi.slot_name, bsp.price_usage_type;

-- 2. 구별 가격 정책 요약
SELECT 
  rgu.name as 행정구,
  COUNT(DISTINCT pi.id) as 패널수,
  COUNT(bsp.id) as 가격정책수,
  COUNT(CASE WHEN bsp.price_usage_type = 'default' THEN 1 END) as 상업용정책수,
  COUNT(CASE WHEN bsp.price_usage_type = 'public_institution' THEN 1 END) as 행정용정책수,
  COUNT(CASE WHEN bsp.price_usage_type = 're_order' THEN 1 END) as 재사용정책수,
  COUNT(CASE WHEN bsp.price_usage_type = 'self_install' THEN 1 END) as 자체제작정책수,
  COUNT(CASE WHEN bsp.price_usage_type = 'reduction_by_admin' THEN 1 END) as 관리자할인정책수
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_info bsi ON bsi.panel_info_id = pi.id
LEFT JOIN banner_slot_price_policy bsp ON bsp.banner_slot_info_id = bsi.id
WHERE rgu.is_active = true
GROUP BY rgu.name
ORDER BY rgu.name;

-- 3. 표와 비교를 위한 상세 데이터 (관악구)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN bsp.price_usage_type::text = 'default' THEN '상업용'
    WHEN bsp.price_usage_type::text = 'public_institution' THEN '행정용'
    ELSE bsp.price_usage_type::text
  END as 표준용도구분
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND rgu.name = '관악구'
ORDER BY bsi.slot_name, bsp.price_usage_type;

-- 4. 표와 비교를 위한 상세 데이터 (송파구)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN bsp.price_usage_type::text = 'default' THEN '상업용'
    WHEN bsp.price_usage_type::text = 'public_institution' THEN '행정용'
    ELSE bsp.price_usage_type::text
  END as 표준용도구분
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND rgu.name = '송파구'
ORDER BY bsi.slot_name, bsp.price_usage_type;

-- 5. 표와 비교를 위한 상세 데이터 (서대문구)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN bsp.price_usage_type::text = 'default' THEN '상업용'
    WHEN bsp.price_usage_type::text = 'public_institution' THEN '행정용'
    ELSE bsp.price_usage_type::text
  END as 표준용도구분
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND rgu.name = '서대문구'
ORDER BY bsi.slot_name, bsp.price_usage_type;

-- 6. 표와 비교를 위한 상세 데이터 (용산구)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN bsp.price_usage_type = 'default' THEN '상업용'
    WHEN bsp.price_usage_type = 'public_institution' THEN '행정용'
    WHEN bsp.price_usage_type = 're_order' THEN '재사용'
    WHEN bsp.price_usage_type = 'self_install' THEN '자체제작'
    WHEN bsp.price_usage_type = 'reduction_by_admin' THEN '관리자할인'
    ELSE bsp.price_usage_type
  END as 표준용도구분
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND rgu.name = '용산구'
ORDER BY bsi.slot_name, bsp.price_usage_type;

-- 7. 표와 비교를 위한 상세 데이터 (마포구)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN bsp.price_usage_type = 'default' THEN '상업용'
    WHEN bsp.price_usage_type = 'public_institution' THEN '행정용'
    WHEN bsp.price_usage_type = 're_order' THEN '재사용'
    WHEN bsp.price_usage_type = 'self_install' THEN '자체제작'
    WHEN bsp.price_usage_type = 'reduction_by_admin' THEN '관리자할인'
    ELSE bsp.price_usage_type
  END as 표준용도구분
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
  AND rgu.name = '마포구'
ORDER BY bsi.slot_name, bsp.price_usage_type;

-- 8. 가격 정책 타입별 통계
SELECT 
  bsp.price_usage_type as 용도구분,
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

-- 9. 누락된 가격 정책 확인
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

-- 10. 표와 정확히 일치하는지 확인하는 쿼리 (관악구 예시)
SELECT 
  rgu.name as 행정구,
  bsi.slot_name as 패널종류,
  CASE 
    WHEN bsp.price_usage_type = 'default' THEN '상업용'
    WHEN bsp.price_usage_type = 'public_institution' THEN '행정용'
    WHEN bsp.price_usage_type = 're_order' THEN '재사용'
    WHEN bsp.price_usage_type = 'self_install' THEN '자체제작'
    ELSE bsp.price_usage_type
  END as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료,
  CASE 
    WHEN rgu.name = '관악구' AND bsi.slot_name = '상업용' AND bsp.price_usage_type = 'default' AND bsp.total_price = 110000 THEN '일치'
    WHEN rgu.name = '관악구' AND bsi.slot_name = '재사용' AND bsp.price_usage_type = 're_order' AND bsp.total_price = 78000 THEN '일치'
    WHEN rgu.name = '관악구' AND bsi.slot_name = '자체제작' AND bsp.price_usage_type = 'self_install' AND bsp.total_price = 78000 THEN '일치'
    ELSE '불일치'
  END as 표일치여부
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.name = '관악구'
ORDER BY bsi.slot_name, bsp.price_usage_type; 