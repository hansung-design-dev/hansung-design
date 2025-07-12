-- 매달 자동으로 기간을 생성하는 함수
CREATE OR REPLACE FUNCTION create_monthly_display_periods()
RETURNS void AS $$
DECLARE
  region RECORD;
  display RECORD;
  month_offset INT;
  target_month TEXT;
  first_half_from DATE;
  first_half_to DATE;
  second_half_from DATE;
  second_half_to DATE;
BEGIN
  -- 이번달(0)과 다음달(1) 생성
  FOR month_offset IN 0..1 LOOP
    target_month := to_char((date_trunc('month', now()) + (month_offset * interval '1 month')), 'YYYY-MM');

    -- is_active인 구만 선택
    FOR region IN SELECT id, name FROM region_gu WHERE is_active = true LOOP
      -- display_types에서 name이 'banner_display'인 것만 선택 (현수막게시대만)
      FOR display IN SELECT id FROM display_types WHERE name = 'banner_display' LOOP

        -- 마포구는 특별한 기간 설정
        IF region.name = '마포구' THEN
          first_half_from := to_date(target_month || '-05', 'YYYY-MM-DD');
          first_half_to := to_date(target_month || '-19', 'YYYY-MM-DD');
          second_half_from := to_date(target_month || '-20', 'YYYY-MM-DD');
          second_half_to := to_date(to_char((to_date(target_month || '-01', 'YYYY-MM-DD') + interval '1 month'), 'YYYY-MM') || '-04', 'YYYY-MM-DD');
        ELSE
          -- 다른 구들은 1일-14일, 15일-말일
          first_half_from := to_date(target_month || '-01', 'YYYY-MM-DD');
          first_half_to := to_date(target_month || '-14', 'YYYY-MM-DD');
          second_half_from := to_date(target_month || '-15', 'YYYY-MM-DD');
          second_half_to := (date_trunc('month', to_date(target_month || '-01', 'YYYY-MM-DD')) + interval '1 month - 1 day')::date;
        END IF;

        -- 상반기 데이터가 이미 존재하는지 확인 후 삽입
        IF NOT EXISTS (
          SELECT 1 FROM region_gu_display_periods
          WHERE region_gu_id = region.id
            AND display_type_id = display.id
            AND year_month = target_month
            AND half_period = 'first_half'
        ) THEN
          INSERT INTO region_gu_display_periods (
            id,
            display_type_id,
            region_gu_id,
            period_from,
            period_to,
            created_at,
            updated_at,
            year_month,
            half_period,
            total_faces,
            available_faces
          ) VALUES (
            gen_random_uuid(),
            display.id,
            region.id,
            first_half_from,
            first_half_to,
            now(),
            now(),
            target_month,
            'first_half',
            0,
            0
          );
        END IF;

        -- 하반기 데이터가 이미 존재하는지 확인 후 삽입
        IF NOT EXISTS (
          SELECT 1 FROM region_gu_display_periods
          WHERE region_gu_id = region.id
            AND display_type_id = display.id
            AND year_month = target_month
            AND half_period = 'second_half'
        ) THEN
          INSERT INTO region_gu_display_periods (
            id,
            display_type_id,
            region_gu_id,
            period_from,
            period_to,
            created_at,
            updated_at,
            year_month,
            half_period,
            total_faces,
            available_faces
          ) VALUES (
            gen_random_uuid(),
            display.id,
            region.id,
            second_half_from,
            second_half_to,
            now(),
            now(),
            target_month,
            'second_half',
            0,
            0
          );
        END IF;
          
        RAISE NOTICE '기간 생성 완료: % - % (상반기: % ~ %, 하반기: % ~ %)', 
          region.name, target_month, first_half_from, first_half_to, second_half_from, second_half_to;

      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 매월 1일 자동 실행을 위한 트리거 함수
CREATE OR REPLACE FUNCTION check_and_create_monthly_periods()
RETURNS trigger AS $$
BEGIN
  -- 매월 1일 00:00 한국시간에 실행
  IF EXTRACT(DAY FROM NOW() AT TIME ZONE 'Asia/Seoul') = 1 AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Seoul') = 0 THEN
    PERFORM create_monthly_display_periods();
    RAISE NOTICE '매월 기간 생성 트리거 실행 완료 (한국시간 기준)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (매일 실행되지만 1일 00:00에만 실제 동작)
DROP TRIGGER IF EXISTS monthly_periods_trigger ON region_gu_display_periods;
CREATE TRIGGER monthly_periods_trigger
  AFTER INSERT ON region_gu_display_periods
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_monthly_periods();

-- =================================================================
-- banner_slot_inventory 테이블 생성
-- =================================================================

-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS banner_slot_inventory;

CREATE TABLE banner_slot_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID REFERENCES panel_info(id),
    region_gu_display_period_id UUID REFERENCES region_gu_display_periods(id),
    total_faces INTEGER NOT NULL DEFAULT 0, -- 총 면 수
    available_faces INTEGER NOT NULL DEFAULT 0, -- 사용 가능한 면 수
    closed_faces INTEGER DEFAULT 0, -- 마감된 면 수
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(panel_info_id, region_gu_display_period_id)
);

-- 인덱스 생성
CREATE INDEX idx_banner_slot_inventory_panel 
ON banner_slot_inventory(panel_info_id);

CREATE INDEX idx_banner_slot_inventory_period 
ON banner_slot_inventory(region_gu_display_period_id);

-- =================================================================
-- 7월 데이터 수동 생성 (2024-07)
-- =================================================================

-- 먼저 7월 데이터가 있는지 확인하고 삭제
DELETE FROM region_gu_display_periods WHERE year_month = '2024-07';

-- 기존 UNIQUE 제약조건 삭제 후 새로운 제약조건 추가
ALTER TABLE region_gu_display_periods 
DROP CONSTRAINT IF EXISTS region_gu_display_periods_region_gu_id_display_type_id_year_month_key;

ALTER TABLE region_gu_display_periods 
ADD CONSTRAINT region_gu_display_periods_region_gu_id_display_type_id_year_month_half_period_key
UNIQUE (region_gu_id, display_type_id, year_month, half_period);

-- 7월 데이터 생성 (상하반기별로 분리)
DO $$
DECLARE
  region RECORD;
  display RECORD;
  target_month TEXT := '2024-07';
  first_half_from DATE;
  first_half_to DATE;
  second_half_from DATE;
  second_half_to DATE;
BEGIN
  -- is_active인 구만 선택
  FOR region IN SELECT id, name FROM region_gu WHERE is_active = true LOOP
    -- display_types에서 name이 'banner_display'인 것만 선택
    FOR display IN SELECT id FROM display_types WHERE name = 'banner_display' LOOP

      -- 마포구는 특별한 기간 설정
      IF region.name = '마포구' THEN
        first_half_from := to_date(target_month || '-05', 'YYYY-MM-DD');
        first_half_to := to_date(target_month || '-19', 'YYYY-MM-DD');
        second_half_from := to_date(target_month || '-20', 'YYYY-MM-DD');
        second_half_to := to_date('2024-08-04', 'YYYY-MM-DD');
      ELSE
        -- 다른 구들은 1일-14일, 15일-말일
        first_half_from := to_date(target_month || '-01', 'YYYY-MM-DD');
        first_half_to := to_date(target_month || '-15', 'YYYY-MM-DD');
        second_half_from := to_date(target_month || '-16', 'YYYY-MM-DD');
        second_half_to := to_date(target_month || '-31', 'YYYY-MM-DD');
      END IF;

      -- 상반기 데이터 삽입
      INSERT INTO region_gu_display_periods (
        id,
        display_type_id,
        region_gu_id,
        period_from,
        period_to,
        created_at,
        updated_at,
        year_month,
        half_period,
        total_faces,
        available_faces
      ) VALUES (
        gen_random_uuid(),
        display.id,
        region.id,
        first_half_from,
        first_half_to,
        now(),
        now(),
        target_month,
        'first_half',
        0,
        0
      );
      
      -- 하반기 데이터 삽입
      INSERT INTO region_gu_display_periods (
        id,
        display_type_id,
        region_gu_id,
        period_from,
        period_to,
        created_at,
        updated_at,
        year_month,
        half_period,
        total_faces,
        available_faces
      ) VALUES (
        gen_random_uuid(),
        display.id,
        region.id,
        second_half_from,
        second_half_to,
        now(),
        now(),
        target_month,
        'second_half',
        0,
        0
      );
      
      RAISE NOTICE '7월 데이터 생성 완료: % (상반기: % ~ %, 하반기: % ~ %)', 
        region.name, first_half_from, first_half_to, second_half_from, second_half_to;

    END LOOP;
  END LOOP;
END $$;

-- =================================================================
-- banner_slot_inventory 초기 데이터 생성 (7월)
-- =================================================================

-- 7월 banner_slot_inventory 데이터 생성 (상반기)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    CASE 
        WHEN pi.panel_type = 'bulletin-board' THEN 1  -- 시민게시대는 1면
        WHEN pi.panel_type IN ('lower-panel', 'multi-panel') THEN 5  -- 저단형, 연립형은 5면
        ELSE 1  -- 기본값
    END,
    CASE 
        WHEN pi.panel_type = 'bulletin-board' THEN 1
        WHEN pi.panel_type IN ('lower-panel', 'multi-panel') THEN 5
        ELSE 1
    END
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE pi.panel_type IN ('bulletin-board', 'lower-panel', 'multi-panel', 'panel')
AND rgdp.year_month = '2024-07'
AND rg.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM banner_slot_inventory bsi 
    WHERE bsi.panel_info_id = pi.id 
    AND bsi.region_gu_display_period_id = rgdp.id
);

-- 7월 banner_slot_inventory 데이터 생성 (하반기)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    CASE 
        WHEN pi.panel_type = 'bulletin-board' THEN 1
        WHEN pi.panel_type IN ('lower-panel', 'multi-panel') THEN 5
        ELSE 1
    END,
    CASE 
        WHEN pi.panel_type = 'bulletin-board' THEN 1
        WHEN pi.panel_type IN ('lower-panel', 'multi-panel') THEN 5
        ELSE 1
    END
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE pi.panel_type IN ('bulletin-board', 'lower-panel', 'multi-panel', 'panel')
AND rgdp.year_month = '2024-07'
AND rg.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM banner_slot_inventory bsi 
    WHERE bsi.panel_info_id = pi.id 
    AND bsi.region_gu_display_period_id = rgdp.id
);

-- 수동으로 실행할 수 있는 함수도 제공
-- SELECT create_monthly_display_periods();

-- 현재 기간 설정 확인
SELECT 
  rg.name as 구명,
  rgdp.year_month as 년월,
  rgdp.half_period as 기간,
  rgdp.period_from as 시작일,
  rgdp.period_to as 종료일,
  rgdp.total_faces as 총면수,
  rgdp.available_faces as 사용가능면수
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
WHERE rgdp.year_month >= '2024-07'
ORDER BY rg.name, rgdp.year_month, rgdp.half_period;

-- banner_slot_inventory 데이터 확인
SELECT 
  rg.name as 구명,
  pi.panel_code,
  pi.panel_type,
  rgdp.year_month,
  rgdp.half_period,
  bsi.total_faces,
  bsi.available_faces,
  bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rgdp.year_month = '2024-07'
ORDER BY rg.name, pi.panel_code, rgdp.year_month, rgdp.half_period;
