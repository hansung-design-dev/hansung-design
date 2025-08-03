-- LED 캐시 테이블 생성
-- LED 디스플레이 정보를 빠르게 조회하기 위한 캐시 테이블

CREATE TABLE IF NOT EXISTS public.led_display_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL,
  region_name character varying NOT NULL,
  region_code character varying NOT NULL,
  logo_image_url text,
  phone_number character varying,
  panel_count integer DEFAULT 0,
  price_summary text,
  period_summary text,
  bank_name character varying,
  account_number character varying,
  depositor character varying,
  display_order integer DEFAULT 999,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT led_display_cache_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_cache_region_id_key UNIQUE (region_id),
  CONSTRAINT led_display_cache_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.region_gu(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_led_display_cache_region_code ON public.led_display_cache(region_code);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_display_order ON public.led_display_cache(display_order);
CREATE INDEX IF NOT EXISTS idx_led_display_cache_last_updated ON public.led_display_cache(last_updated);

-- LED 캐시 테이블에 초기 데이터 삽입
INSERT INTO led_display_cache (
  region_id,
  region_name,
  region_code,
  logo_image_url,
  phone_number,
  panel_count,
  price_summary,
  period_summary,
  bank_name,
  account_number,
  depositor,
  display_order
)
SELECT 
  rg.id as region_id,
  rg.name as region_name,
  rg.code as region_code,
  rg.logo_image_url,
  rg.phone_number,
  COUNT(DISTINCT p.id) as panel_count,
  CASE 
    WHEN COUNT(DISTINCT ldp.id) > 0 THEN 'LED 패널 가격 정책 있음'
    ELSE 'LED 패널 가격 정책 없음'
  END as price_summary,
  CASE 
    WHEN COUNT(DISTINCT rgdp.id) > 0 THEN '게시 기간 설정됨'
    ELSE '게시 기간 미설정'
  END as period_summary,
  ba.bank_name,
  ba.account_number,
  ba.depositor,
  rg.display_order
FROM region_gu rg
LEFT JOIN panels p ON rg.id = p.region_gu_id AND p.panel_type = 'led' AND p.panel_status = 'active'
LEFT JOIN led_display_price_policy ldp ON p.id = ldp.panel_id
LEFT JOIN region_gu_display_periods rgdp ON rg.id = rgdp.region_gu_id
LEFT JOIN bank_accounts ba ON rg.id = ba.region_gu_id AND ba.display_type_id = (SELECT id FROM display_types WHERE name = 'led_display')
WHERE EXISTS (
  SELECT 1 FROM panels p2 
  WHERE p2.region_gu_id = rg.id 
    AND p2.panel_type = 'led' 
    AND p2.panel_status = 'active'
)
GROUP BY rg.id, rg.name, rg.code, rg.logo_image_url, rg.phone_number, rg.display_order, ba.bank_name, ba.account_number, ba.depositor
ON CONFLICT (region_id) DO UPDATE SET
  region_name = EXCLUDED.region_name,
  region_code = EXCLUDED.region_code,
  logo_image_url = EXCLUDED.logo_image_url,
  phone_number = EXCLUDED.phone_number,
  panel_count = EXCLUDED.panel_count,
  price_summary = EXCLUDED.price_summary,
  period_summary = EXCLUDED.period_summary,
  bank_name = EXCLUDED.bank_name,
  account_number = EXCLUDED.account_number,
  depositor = EXCLUDED.depositor,
  display_order = EXCLUDED.display_order,
  last_updated = now(); 