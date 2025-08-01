-- 현수막 게시대 카드용 요약 뷰 생성 (성능 최적화)
CREATE OR REPLACE VIEW banner_display_summary AS
WITH district_summary AS (
  SELECT 
    rg.id as region_id,
    rg.name as region_name,
    rg.code as region_code,
    rg.logo_image_url,
    rg.phone_number,
    rg.display_type_id,
    rg.is_active,
    COUNT(p.id) as panel_count,
    -- 가격 정책 요약
    STRING_AGG(
      DISTINCT 
      CASE 
        WHEN p.panel_type = 'panel' AND bsp.price_usage_type = 'default' THEN '상업용'
        WHEN p.panel_type = 'panel' AND bsp.price_usage_type = 'self_install' THEN '자체제작'
        WHEN p.panel_type = 'panel' AND bsp.price_usage_type = 'public_institution' THEN '행정용'
        WHEN p.panel_type = 'multi_panel' AND bsp.price_usage_type = 'default' THEN '상업용'
        WHEN p.panel_type = 'multi_panel' AND bsp.price_usage_type = 'public_institution' THEN '행정용'
        WHEN p.panel_type = 'lower_panel' AND bsp.price_usage_type = 'default' THEN '저단형상업용'
        WHEN p.panel_type = 'lower_panel' AND bsp.price_usage_type = 'public_institution' THEN '저단형행정용'
        WHEN p.panel_type = 'semi_auto' AND p.panel_code IN (11,17,19) AND bsp.price_usage_type = 'default' THEN '상업용(패널형)'
        WHEN p.panel_type = 'semi_auto' AND p.panel_code IN (11,17,19) AND bsp.price_usage_type = 'public_institution' THEN '행정용(패널형)'
        WHEN p.panel_type = 'semi_auto' AND p.panel_code NOT IN (11,17,19) AND bsp.price_usage_type = 'default' THEN '상업용(현수막)'
        WHEN p.panel_type = 'semi_auto' AND p.panel_code NOT IN (11,17,19) AND bsp.price_usage_type = 'public_institution' THEN '행정용(현수막)'
        ELSE bsp.price_usage_type
      END || ':' || bsp.total_price::text,
      ', '
    ) as price_summary
  FROM region_gu rg
  LEFT JOIN panels p ON rg.id = p.region_gu_id AND p.panel_status = 'active'
  LEFT JOIN banner_slots bs ON p.id = bs.panel_id AND bs.slot_number = 1
  LEFT JOIN banner_slot_price_policy bsp ON bs.id = bsp.banner_slot_id
  WHERE rg.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
    AND rg.is_active = 'true'
  GROUP BY rg.id, rg.name, rg.code, rg.logo_image_url, rg.phone_number, rg.display_type_id, rg.is_active
),
period_summary AS (
  SELECT 
    rgdp.region_gu_id,
    rgdp.year_month,
    STRING_AGG(
      rgdp.period_from || '~' || rgdp.period_to,
      ', '
      ORDER BY rgdp.period_from
    ) as period_summary
  FROM region_gu_display_periods rgdp
  WHERE rgdp.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
    AND rgdp.year_month = (
      SELECT 
        CASE 
          WHEN EXTRACT(DAY FROM NOW() AT TIME ZONE 'Asia/Seoul') >= 13 THEN
            CASE 
              WHEN EXTRACT(MONTH FROM NOW() AT TIME ZONE 'Asia/Seoul') = 12 THEN
                (EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Asia/Seoul') + 1) || '년 1월'
              ELSE
                EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Asia/Seoul') || '년 ' || (EXTRACT(MONTH FROM NOW() AT TIME ZONE 'Asia/Seoul') + 1) || '월'
            END
          ELSE
            EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Asia/Seoul') || '년 ' || EXTRACT(MONTH FROM NOW() AT TIME ZONE 'Asia/Seoul') || '월'
        END
    )
  GROUP BY rgdp.region_gu_id, rgdp.year_month
),
bank_summary AS (
  SELECT 
    ba.region_gu_id,
    ba.bank_name,
    ba.account_number,
    ba.depositor
  FROM bank_accounts ba
  WHERE ba.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
)
SELECT 
  ds.region_id,
  ds.region_name,
  ds.region_code,
  ds.logo_image_url,
  ds.phone_number,
  ds.panel_count,
  ds.price_summary,
  ps.period_summary,
  bs.bank_name,
  bs.account_number,
  bs.depositor
FROM district_summary ds
LEFT JOIN period_summary ps ON ds.region_id = ps.region_gu_id
LEFT JOIN bank_summary bs ON ds.region_id = bs.region_gu_id
ORDER BY 
  CASE ds.region_name
    WHEN '관악구' THEN 1
    WHEN '마포구' THEN 2
    WHEN '서대문구' THEN 3
    WHEN '송파구' THEN 4
    WHEN '용산구' THEN 5
    WHEN '강북구' THEN 6
    ELSE 999
  END;

-- 뷰 권한 설정
GRANT SELECT ON banner_display_summary TO authenticated;
GRANT SELECT ON banner_display_summary TO anon; 