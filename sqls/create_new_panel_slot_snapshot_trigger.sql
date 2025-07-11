-- =================================================================
-- 새로운 panel_slot_snapshot 트리거 (현재 스키마 기반)
-- =================================================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_fill_panel_slot_snapshot ON orders;
DROP TRIGGER IF EXISTS trigger_update_snapshot_after_order_details ON order_details;
DROP FUNCTION IF EXISTS fill_panel_slot_snapshot();
DROP FUNCTION IF EXISTS update_snapshot_after_order_details();

-- 새로운 panel_slot_snapshot 채우기 함수
CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
    v_order_details_count INTEGER;
BEGIN
    -- 디버깅 로그
    RAISE NOTICE '트리거 실행: 주문 ID %', NEW.id;
    
    -- order_details가 생성될 때까지 잠시 대기 (최대 1초)
    FOR i IN 1..10 LOOP
        SELECT COUNT(*) INTO v_order_details_count
        FROM order_details 
        WHERE order_id = NEW.id;
        
        IF v_order_details_count > 0 THEN
            EXIT;
        END IF;
        
        -- 0.1초 대기
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- 첫 번째 order_details에서 panel_info_id 가져오기
    SELECT panel_info_id, panel_slot_usage_id 
    INTO v_slot_record
    FROM order_details 
    WHERE order_id = NEW.id 
    LIMIT 1;
    
    RAISE NOTICE 'order_details 조회: panel_info_id = %, panel_slot_usage_id = %', 
        v_slot_record.panel_info_id, v_slot_record.panel_slot_usage_id;
    
    -- panel_info_id가 없으면 처리하지 않음
    IF v_slot_record.panel_info_id IS NULL THEN
        RAISE NOTICE 'panel_info_id가 NULL이므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- 패널 타입 확인
    SELECT dt.name INTO v_panel_type
    FROM panel_info pi
    JOIN display_types dt ON pi.display_type_id = dt.id
    WHERE pi.id = v_slot_record.panel_info_id;
    
    RAISE NOTICE '패널 타입: %', v_panel_type;
    
    -- 패널 타입에 따라 슬롯 정보 조회
    IF v_panel_type = 'banner_display' THEN
        -- 배너 패널: panel_slot_usage가 있으면 해당 슬롯, 없으면 1번 슬롯
        SELECT * INTO v_slot_record 
        FROM banner_slot_info
        WHERE panel_info_id = v_slot_record.panel_info_id
          AND slot_number = COALESCE(
            (SELECT slot_number FROM panel_slot_usage WHERE id = v_slot_record.panel_slot_usage_id),
            1  -- 기본값: 1번 슬롯
          );
        
        RAISE NOTICE '배너 슬롯 조회: slot_number = %, id = %', 
            v_slot_record.slot_number, v_slot_record.id;
            
    ELSIF v_panel_type = 'led_display' THEN
        -- LED 패널: panel_slot_usage가 있으면 해당 슬롯, 없으면 1번 슬롯
        SELECT * INTO v_slot_record 
        FROM led_slot_info
        WHERE panel_info_id = v_slot_record.panel_info_id
          AND slot_number = COALESCE(
            (SELECT slot_number FROM panel_slot_usage WHERE id = v_slot_record.panel_slot_usage_id),
            1  -- 기본값: 1번 슬롯
          );
        
        RAISE NOTICE 'LED 슬롯 조회: slot_number = %, id = %', 
            v_slot_record.slot_number, v_slot_record.id;
    ELSE
        RAISE NOTICE '알 수 없는 패널 타입: %', v_panel_type;
        RETURN NEW;
    END IF;
    
    -- 슬롯 정보가 없으면 처리하지 않음
    IF v_slot_record.id IS NULL THEN
        RAISE NOTICE '슬롯 정보를 찾을 수 없으므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- JSONB 스냅샷 생성
    v_snapshot := to_jsonb(v_slot_record);
    
    RAISE NOTICE '생성된 스냅샷: %', v_snapshot;
    
    -- orders 테이블의 panel_slot_snapshot 업데이트
    UPDATE orders 
    SET panel_slot_snapshot = v_snapshot
    WHERE id = NEW.id;
    
    RAISE NOTICE 'panel_slot_snapshot 업데이트 완료: 주문 ID %', NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- orders 테이블에 트리거 생성
CREATE TRIGGER trigger_fill_panel_slot_snapshot
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fill_panel_slot_snapshot();

-- order_details INSERT 후에도 스냅샷을 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_snapshot_after_order_details()
RETURNS TRIGGER AS $$
DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
BEGIN
    -- 패널 타입 확인
    SELECT dt.name INTO v_panel_type
    FROM panel_info pi
    JOIN display_types dt ON pi.display_type_id = dt.id
    WHERE pi.id = NEW.panel_info_id;
    
    -- 패널 타입에 따라 슬롯 정보 조회
    IF v_panel_type = 'banner_display' THEN
        SELECT * INTO v_slot_record 
        FROM banner_slot_info
        WHERE panel_info_id = NEW.panel_info_id
          AND slot_number = COALESCE(
            (SELECT slot_number FROM panel_slot_usage WHERE id = NEW.panel_slot_usage_id),
            1
          );
    ELSIF v_panel_type = 'led_display' THEN
        SELECT * INTO v_slot_record 
        FROM led_slot_info
        WHERE panel_info_id = NEW.panel_info_id
          AND slot_number = COALESCE(
            (SELECT slot_number FROM panel_slot_usage WHERE id = NEW.panel_slot_usage_id),
            1
          );
    END IF;
    
    IF v_slot_record.id IS NOT NULL THEN
        -- JSONB 스냅샷 생성
        v_snapshot := to_jsonb(v_slot_record);
        
        -- orders 테이블의 panel_slot_snapshot 업데이트
        UPDATE orders 
        SET panel_slot_snapshot = v_snapshot
        WHERE id = NEW.order_id;
        
        RAISE NOTICE 'order_details INSERT 후 스냅샷 업데이트: 주문 ID %, 패널 ID %', 
            NEW.order_id, NEW.panel_info_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- order_details 테이블에 트리거 생성
CREATE TRIGGER trigger_update_snapshot_after_order_details
    AFTER INSERT ON order_details
    FOR EACH ROW
    EXECUTE FUNCTION update_snapshot_after_order_details();

-- 트리거 생성 확인
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_fill_panel_slot_snapshot', 'trigger_update_snapshot_after_order_details')
ORDER BY trigger_name; 