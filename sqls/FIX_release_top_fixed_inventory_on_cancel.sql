-- ⚠️ 긴급 수정: release_top_fixed_inventory_on_cancel 함수
-- orders 테이블에는 banner_slot_id가 없으므로 OLD.banner_slot_id를 참조하면 에러 발생!
-- orders UPDATE 시점에는 이미 order_details가 생성되어 있으므로 이를 통해 banner_slot_id를 찾아야 함

CREATE OR REPLACE FUNCTION release_top_fixed_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  banner_slot_id_val UUID;
BEGIN
  -- orders 테이블에는 banner_slot_id가 없으므로
  -- 해당 주문의 order_details를 통해 banner_slot_id를 찾아야 함
  
  -- 주문이 취소되었는지 확인 (payment_status 변경 체크)
  IF NEW.payment_status = 'cancelled' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'cancelled') THEN
    -- 해당 주문의 첫 번째 order_details에서 banner_slot_id 찾기
    SELECT 
      psu.banner_slot_id INTO banner_slot_id_val
    FROM order_details od
    JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
    WHERE od.order_id = NEW.id
      AND psu.banner_slot_id IS NOT NULL
    LIMIT 1;
    
    -- banner_slot_id를 찾았고, 상단광고인 경우에만 재고 해제
    IF banner_slot_id_val IS NOT NULL THEN
      IF EXISTS (
        SELECT 1 FROM banner_slots bs 
        WHERE bs.id = banner_slot_id_val 
        AND bs.banner_type = 'top_fixed'
      ) THEN
        -- 상단광고 재고 해제
        UPDATE top_fixed_banner_inventory 
        SET 
          is_occupied = false,
          occupied_slot_id = null::uuid,
          occupied_from = null::date,
          occupied_until = null::date,
          updated_at = NOW()
        WHERE occupied_slot_id = banner_slot_id_val;

        RAISE NOTICE '상단광고 재고 해제: slot_id=%', banner_slot_id_val;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

