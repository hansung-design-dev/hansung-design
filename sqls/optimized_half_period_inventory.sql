-- 최적화된 상하반기 재고관리 스키마
-- 가격정책별 재고를 통합하여 관리하여 데이터 폭증 방지

-- 1. 기존 트리거 삭제
DROP TRIGGER IF EXISTS banner_inventory_insert_trigger ON order_details;
DROP TRIGGER IF EXISTS banner_inventory_delete_trigger ON order_details;
DROP TRIGGER IF EXISTS inventory_check_trigger ON order_details;
DROP TRIGGER IF EXISTS create_inventory_on_period_insert_trigger ON region_gu_display_periods;

-- 2. 최적화된 재고 관리 함수들

-- 주문 시 패널 단위로 재고 관리 (가격정책 무관)
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  panel_record RECORD;
  target_period TEXT;
BEGIN
  -- order_details의 display_start_date를 기반으로 해당하는 상하반기 기간 찾기
  SELECT rgdp.id, rgdp.period INTO period_id, target_period
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 상하반기 기간의 재고 업데이트 (패널 단위)
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      available_slots = GREATEST(0, available_slots - NEW.slot_order_quantity),
      closed_slots = closed_slots + NEW.slot_order_quantity,
      updated_at = NOW()
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 없으면 새로 생성
    IF NOT FOUND THEN
      SELECT * INTO panel_record FROM panel_info WHERE id = NEW.panel_info_id;
      INSERT INTO banner_slot_inventory (
        panel_info_id,
        region_gu_display_period_id,
        total_slots,
        available_slots,
        closed_slots
      )
      VALUES (
        NEW.panel_info_id,
        period_id,
        panel_record.max_banner,
        GREATEST(0, panel_record.max_banner - NEW.slot_order_quantity),
        NEW.slot_order_quantity
      );
    END IF;
    
    -- 디버깅용 로그
    RAISE NOTICE '재고 감소 완료: panel_id=%, period_id=%, period=%, 감소수량=%', 
      NEW.panel_info_id, period_id, target_period, NEW.slot_order_quantity;
  ELSE
    -- 기간을 찾지 못한 경우 로그 출력 (디버깅용)
    RAISE NOTICE '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 취소 시 재고 자동 복구
CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  target_period TEXT;
BEGIN
  -- order_details의 display_start_date를 기반으로 해당하는 상하반기 기간 찾기
  SELECT rgdp.id, rgdp.period INTO period_id, target_period
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = OLD.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 상하반기 기간의 재고 복구
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
      closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
      updated_at = NOW()
    WHERE panel_info_id = OLD.panel_info_id
      AND region_gu_display_period_id = period_id;
      
    -- 디버깅용 로그
    RAISE NOTICE '재고 복구 완료: panel_id=%, period_id=%, period=%, 복구수량=%', 
      OLD.panel_info_id, period_id, target_period, OLD.slot_order_quantity;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 재고 부족 시 주문 방지
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  current_inventory RECORD;
  target_period TEXT;
BEGIN
  -- order_details의 display_start_date를 기반으로 해당하는 상하반기 기간 찾기
  SELECT rgdp.id, rgdp.period INTO period_id, target_period
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 상하반기 기간의 재고 확인
  IF period_id IS NOT NULL THEN
    SELECT available_slots, total_slots INTO current_inventory
    FROM banner_slot_inventory
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
    IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
      RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개 (상하반기: %)', 
        NEW.slot_order_quantity, current_inventory.available_slots, target_period;
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 경고
    RAISE WARNING '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기간 생성 시 자동으로 재고 생성 (패널 단위)
CREATE OR REPLACE FUNCTION create_inventory_on_period_insert()
RETURNS TRIGGER AS $$
DECLARE
    panel_record RECORD;
    top_fixed_record RECORD;
BEGIN
    -- 배너 디스플레이 타입인 경우에만 재고 생성
    IF EXISTS (
        SELECT 1 FROM display_types dt 
        WHERE dt.id = NEW.display_type_id AND dt.name = 'banner_display'
    ) THEN
        -- 해당 구의 모든 패널에 대해 재고 생성 (패널 단위)
        FOR panel_record IN 
            SELECT 
                pi.id as panel_info_id,
                pi.max_banner as total_slots,
                pi.first_half_closure_quantity,
                pi.second_half_closure_quantity
            FROM panel_info pi
            WHERE pi.region_gu_id = NEW.region_gu_id
              AND pi.display_type_id = NEW.display_type_id
              AND pi.panel_status = 'active'
        LOOP
            -- banner_slot_inventory 생성 (패널 단위, 가격정책 무관)
            INSERT INTO banner_slot_inventory (
                panel_info_id,
                region_gu_display_period_id,
                total_slots,
                available_slots,
                closed_slots
            )
            VALUES (
                panel_record.panel_info_id,
                NEW.id,
                panel_record.total_slots,
                CASE 
                    WHEN NEW.period = 'first_half' THEN 
                        panel_record.total_slots - COALESCE(panel_record.first_half_closure_quantity, 0)
                    WHEN NEW.period = 'second_half' THEN 
                        panel_record.total_slots - COALESCE(panel_record.second_half_closure_quantity, 0)
                    ELSE 
                        panel_record.total_slots -- full_month인 경우
                END,
                CASE 
                    WHEN NEW.period = 'first_half' THEN 
                        COALESCE(panel_record.first_half_closure_quantity, 0)
                    WHEN NEW.period = 'second_half' THEN 
                        COALESCE(panel_record.second_half_closure_quantity, 0)
                    ELSE 
                        0 -- full_month인 경우
                END
            );
            
            -- top_fixed_banner_inventory 생성 (해당 패널에 top_fixed 슬롯이 있는 경우)
            FOR top_fixed_record IN 
                SELECT 
                    bsi.id as banner_slot_info_id,
                    bsi.slot_number
                FROM banner_slot_info bsi
                WHERE bsi.panel_info_id = panel_record.panel_info_id
                  AND bsi.banner_type = 'top_fixed'
                  AND bsi.panel_slot_status = 'available'
            LOOP
                INSERT INTO top_fixed_banner_inventory (
                    panel_info_id,
                    region_gu_display_period_id,
                    banner_slot_info_id,
                    total_slots,
                    available_slots,
                    closed_faces
                )
                VALUES (
                    panel_record.panel_info_id,
                    NEW.id,
                    top_fixed_record.banner_slot_info_id,
                    1, -- top_fixed는 보통 1개 슬롯
                    1, -- 초기에는 모두 사용 가능
                    0
                );
            END LOOP;
        END LOOP;
        
        RAISE NOTICE '상하반기 재고 생성 완료: period_id=%, period=%, region_gu_id=%', 
            NEW.id, NEW.period, NEW.region_gu_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 트리거 등록
CREATE TRIGGER banner_inventory_insert_trigger
  AFTER INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_slot_inventory_on_order();

CREATE TRIGGER banner_inventory_delete_trigger
  AFTER DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION restore_banner_slot_inventory_on_order_delete();

CREATE TRIGGER inventory_check_trigger
  BEFORE INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_before_order();

CREATE TRIGGER create_inventory_on_period_insert_trigger
  AFTER INSERT ON region_gu_display_periods
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_on_period_insert();

-- 4. 최적화된 재고 현황 뷰 (가격정책 정보 포함)
CREATE OR REPLACE VIEW optimized_inventory_status AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  pi.address,
  rgu.name as district,
  rgdp.year_month,
  rgdp.period as half_period,
  rgdp.period_from,
  rgdp.period_to,
  bsi.total_slots,
  bsi.available_slots,
  bsi.closed_slots,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as inventory_status,
  -- 가격정책 정보 (JSON 형태로 통합)
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'price_usage_type', bsp.price_usage_type,
        'total_price', bsp.total_price,
        'tax_price', bsp.tax_price,
        'road_usage_fee', bsp.road_usage_fee,
        'advertising_fee', bsp.advertising_fee
      )
    ) FROM banner_slot_price_policy bsp
    JOIN banner_slot_info bsi2 ON bsi2.id = bsp.banner_slot_info_id
    WHERE bsi2.panel_info_id = pi.id), 
    '[]'::json
  ) as price_policies,
  bsi.updated_at as last_updated
FROM panel_info pi
JOIN region_gu rgu ON pi.region_gu_id = rgu.id
JOIN region_gu_display_periods rgdp ON pi.region_gu_id = rgdp.region_gu_id
LEFT JOIN banner_slot_inventory bsi ON pi.id = bsi.panel_info_id 
  AND bsi.region_gu_display_period_id = rgdp.id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND rgdp.display_type_id = pi.display_type_id
ORDER BY rgu.name, pi.nickname, rgdp.year_month, rgdp.period;

-- 5. 재고 통계 뷰 (최적화)
CREATE OR REPLACE VIEW optimized_inventory_summary AS
SELECT 
  rgdp.year_month,
  rgdp.period as half_period,
  rgu.name as district,
  COUNT(bsi.id) as panel_count,
  SUM(bsi.total_slots) as total_slots,
  SUM(bsi.available_slots) as available_slots,
  SUM(bsi.closed_slots) as closed_slots,
  ROUND((SUM(bsi.available_slots)::DECIMAL / SUM(bsi.total_slots)) * 100, 1) as availability_rate,
  COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as sold_out_panels,
  COUNT(CASE WHEN bsi.available_slots <= bsi.total_slots * 0.2 AND bsi.available_slots > 0 THEN 1 END) as low_stock_panels,
  -- 가격정책별 통계
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM banner_slot_price_policy bsp
    JOIN banner_slot_info bsi2 ON bsi2.id = bsp.banner_slot_info_id
    WHERE bsi2.panel_info_id = bsi.panel_info_id AND bsp.price_usage_type = 'default'
  ) THEN bsi.panel_info_id END) as panels_with_default_policy,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM banner_slot_price_policy bsp
    JOIN banner_slot_info bsi2 ON bsi2.id = bsp.banner_slot_info_id
    WHERE bsi2.panel_info_id = bsi.panel_info_id AND bsp.price_usage_type = 'public_institution'
  ) THEN bsi.panel_info_id END) as panels_with_public_policy
FROM region_gu_display_periods rgdp
JOIN region_gu rgu ON rgdp.region_gu_id = rgu.id
LEFT JOIN banner_slot_inventory bsi ON rgdp.id = bsi.region_gu_display_period_id
WHERE rgdp.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
GROUP BY rgdp.year_month, rgdp.period, rgu.name
ORDER BY rgu.name, rgdp.year_month, rgdp.period;

-- 6. 성능 최적화를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_banner_slot_inventory_panel_period 
ON banner_slot_inventory(panel_info_id, region_gu_display_period_id);

CREATE INDEX IF NOT EXISTS idx_region_gu_display_periods_lookup 
ON region_gu_display_periods(region_gu_id, display_type_id, period_from, period_to);

CREATE INDEX IF NOT EXISTS idx_order_details_panel_dates 
ON order_details(panel_info_id, display_start_date, display_end_date);

-- 7. 데이터 정리 함수 (과거 데이터 아카이브)
CREATE OR REPLACE FUNCTION archive_old_inventory_data(months_to_keep INTEGER DEFAULT 6)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
BEGIN
    -- 6개월 이상 된 재고 데이터를 아카이브 테이블로 이동
    INSERT INTO inventory_archive (
        panel_info_id,
        region_gu_display_period_id,
        total_slots,
        available_slots,
        closed_slots,
        archived_at
    )
    SELECT 
        bsi.panel_info_id,
        bsi.region_gu_display_period_id,
        bsi.total_slots,
        bsi.available_slots,
        bsi.closed_slots,
        NOW()
    FROM banner_slot_inventory bsi
    JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
    WHERE rgdp.period_from < CURRENT_DATE - INTERVAL '1 month' * months_to_keep;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- 아카이브된 데이터 삭제
    DELETE FROM banner_slot_inventory 
    WHERE region_gu_display_period_id IN (
        SELECT id FROM region_gu_display_periods 
        WHERE period_from < CURRENT_DATE - INTERVAL '1 month' * months_to_keep
    );
    
    RAISE NOTICE '아카이브 완료: % 개의 재고 레코드', archived_count;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 8. 아카이브 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS inventory_archive (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    panel_info_id uuid,
    region_gu_display_period_id uuid,
    total_slots integer,
    available_slots integer,
    closed_slots integer,
    archived_at timestamp DEFAULT now()
); 