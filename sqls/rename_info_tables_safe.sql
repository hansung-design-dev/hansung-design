-- 수파베이스 테이블명 변경 스크립트 (안전한 버전)
-- 각 섹션별로 실행하세요

-- ========================================
-- 1단계: 기존 테이블 존재 확인
-- ========================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('bank_info', 'banner_slot_info', 'led_slot_info', 'panel_info') 
        THEN 'Will be renamed'
        ELSE 'Will remain unchanged'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bank_info', 'banner_slot_info', 'led_slot_info', 'panel_info');

-- ========================================
-- 2단계: 테이블명 변경
-- ========================================

-- bank_info → bank_accounts
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_info') THEN
        ALTER TABLE public.bank_info RENAME TO bank_accounts;
        RAISE NOTICE 'bank_info renamed to bank_accounts';
    ELSE
        RAISE NOTICE 'bank_info table does not exist';
    END IF;
END $$;

-- banner_slot_info → banner_slots
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banner_slot_info') THEN
        ALTER TABLE public.banner_slot_info RENAME TO banner_slots;
        RAISE NOTICE 'banner_slot_info renamed to banner_slots';
    ELSE
        RAISE NOTICE 'banner_slot_info table does not exist';
    END IF;
END $$;

-- led_slot_info → led_slots
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'led_slot_info') THEN
        ALTER TABLE public.led_slot_info RENAME TO led_slots;
        RAISE NOTICE 'led_slot_info renamed to led_slots';
    ELSE
        RAISE NOTICE 'led_slot_info table does not exist';
    END IF;
END $$;

-- panel_info → panels
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'panel_info') THEN
        ALTER TABLE public.panel_info RENAME TO panels;
        RAISE NOTICE 'panel_info renamed to panels';
    ELSE
        RAISE NOTICE 'panel_info table does not exist';
    END IF;
END $$;

-- ========================================
-- 3단계: 제약조건명 변경
-- ========================================

-- bank_accounts 제약조건 변경
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_accounts') THEN
        -- Primary key
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bank_info_pkey') THEN
            ALTER TABLE public.bank_accounts RENAME CONSTRAINT bank_info_pkey TO bank_accounts_pkey;
            RAISE NOTICE 'bank_info_pkey renamed to bank_accounts_pkey';
        END IF;
        
        -- Foreign keys
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bank_info_region_gu_id_fkey') THEN
            ALTER TABLE public.bank_accounts RENAME CONSTRAINT bank_info_region_gu_id_fkey TO bank_accounts_region_gu_id_fkey;
            RAISE NOTICE 'bank_info_region_gu_id_fkey renamed to bank_accounts_region_gu_id_fkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bank_info_display_type_id_fkey') THEN
            ALTER TABLE public.bank_accounts RENAME CONSTRAINT bank_info_display_type_id_fkey TO bank_accounts_display_type_id_fkey;
            RAISE NOTICE 'bank_info_display_type_id_fkey renamed to bank_accounts_display_type_id_fkey';
        END IF;
    END IF;
END $$;

-- banner_slots 제약조건 변경
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banner_slots') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_slot_info_pkey') THEN
            ALTER TABLE public.banner_slots RENAME CONSTRAINT banner_slot_info_pkey TO banner_slots_pkey;
            RAISE NOTICE 'banner_slot_info_pkey renamed to banner_slots_pkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_slot_info_panel_info_id_fkey') THEN
            ALTER TABLE public.banner_slots RENAME CONSTRAINT banner_slot_info_panel_info_id_fkey TO banner_slots_panel_id_fkey;
            RAISE NOTICE 'banner_slot_info_panel_info_id_fkey renamed to banner_slots_panel_id_fkey';
        END IF;
    END IF;
END $$;

-- led_slots 제약조건 변경
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'led_slots') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_slot_info_pkey') THEN
            ALTER TABLE public.led_slots RENAME CONSTRAINT led_slot_info_pkey TO led_slots_pkey;
            RAISE NOTICE 'led_slot_info_pkey renamed to led_slots_pkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_slot_info_panel_info_id_fkey') THEN
            ALTER TABLE public.led_slots RENAME CONSTRAINT led_slot_info_panel_info_id_fkey TO led_slots_panel_id_fkey;
            RAISE NOTICE 'led_slot_info_panel_info_id_fkey renamed to led_slots_panel_id_fkey';
        END IF;
    END IF;
END $$;

-- panels 제약조건 변경
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'panels') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_info_pkey') THEN
            ALTER TABLE public.panels RENAME CONSTRAINT panel_info_pkey TO panels_pkey;
            RAISE NOTICE 'panel_info_pkey renamed to panels_pkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_info_display_type_id_fkey') THEN
            ALTER TABLE public.panels RENAME CONSTRAINT panel_info_display_type_id_fkey TO panels_display_type_id_fkey;
            RAISE NOTICE 'panel_info_display_type_id_fkey renamed to panels_display_type_id_fkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_info_region_gu_id_fkey') THEN
            ALTER TABLE public.panels RENAME CONSTRAINT panel_info_region_gu_id_fkey TO panels_region_gu_id_fkey;
            RAISE NOTICE 'panel_info_region_gu_id_fkey renamed to panels_region_gu_id_fkey';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_info_region_dong_id_fkey') THEN
            ALTER TABLE public.panels RENAME CONSTRAINT panel_info_region_dong_id_fkey TO panels_region_dong_id_fkey;
            RAISE NOTICE 'panel_info_region_dong_id_fkey renamed to panels_region_dong_id_fkey';
        END IF;
    END IF;
END $$;

-- ========================================
-- 4단계: 컬럼명 변경
-- ========================================

-- panel_info_id → panel_id 컬럼들 변경
DO $$ 
BEGIN
    -- banner_panel_details
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banner_panel_details' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.banner_panel_details RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'banner_panel_details.panel_info_id renamed to panel_id';
    END IF;
    
    -- banner_slots
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banner_slots' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.banner_slots RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'banner_slots.panel_info_id renamed to panel_id';
    END IF;
    
    -- banner_slot_inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banner_slot_inventory' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.banner_slot_inventory RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'banner_slot_inventory.panel_info_id renamed to panel_id';
    END IF;
    
    -- led_display_inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'led_display_inventory' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.led_display_inventory RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'led_display_inventory.panel_info_id renamed to panel_id';
    END IF;
    
    -- led_display_price_policy
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'led_display_price_policy' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.led_display_price_policy RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'led_display_price_policy.panel_info_id renamed to panel_id';
    END IF;
    
    -- led_panel_details
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'led_panel_details' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.led_panel_details RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'led_panel_details.panel_info_id renamed to panel_id';
    END IF;
    
    -- led_slots
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'led_slots' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.led_slots RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'led_slots.panel_info_id renamed to panel_id';
    END IF;
    
    -- order_details
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_details' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.order_details RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'order_details.panel_info_id renamed to panel_id';
    END IF;
    
    -- panel_slot_usage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'panel_slot_usage' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.panel_slot_usage RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'panel_slot_usage.panel_info_id renamed to panel_id';
    END IF;
    
    -- top_fixed_banner_inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'top_fixed_banner_inventory' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.top_fixed_banner_inventory RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'top_fixed_banner_inventory.panel_info_id renamed to panel_id';
    END IF;
END $$;

-- banner_slot_info_id → banner_slot_id 컬럼들 변경
DO $$ 
BEGIN
    -- banner_slot_price_policy
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banner_slot_price_policy' AND column_name = 'banner_slot_info_id') THEN
        ALTER TABLE public.banner_slot_price_policy RENAME COLUMN banner_slot_info_id TO banner_slot_id;
        RAISE NOTICE 'banner_slot_price_policy.banner_slot_info_id renamed to banner_slot_id';
    END IF;
    
    -- panel_slot_usage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'panel_slot_usage' AND column_name = 'banner_slot_info_id') THEN
        ALTER TABLE public.panel_slot_usage RENAME COLUMN banner_slot_info_id TO banner_slot_id;
        RAISE NOTICE 'panel_slot_usage.banner_slot_info_id renamed to banner_slot_id';
    END IF;
    
    -- top_fixed_banner_inventory
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'top_fixed_banner_inventory' AND column_name = 'banner_slot_info_id') THEN
        ALTER TABLE public.top_fixed_banner_inventory RENAME COLUMN banner_slot_info_id TO banner_slot_id;
        RAISE NOTICE 'top_fixed_banner_inventory.banner_slot_info_id renamed to banner_slot_id';
    END IF;
END $$;

-- ========================================
-- 5단계: 외래키 제약조건 업데이트
-- ========================================

-- 외래키 참조를 새로운 테이블명으로 업데이트
DO $$ 
BEGIN
    -- banner_panel_details의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_panel_details_panel_id_fkey') THEN
        ALTER TABLE public.banner_panel_details DROP CONSTRAINT banner_panel_details_panel_id_fkey;
        ALTER TABLE public.banner_panel_details ADD CONSTRAINT banner_panel_details_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'banner_panel_details panel_id foreign key updated';
    END IF;
    
    -- banner_slots의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_slots_panel_id_fkey') THEN
        ALTER TABLE public.banner_slots DROP CONSTRAINT banner_slots_panel_id_fkey;
        ALTER TABLE public.banner_slots ADD CONSTRAINT banner_slots_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'banner_slots panel_id foreign key updated';
    END IF;
    
    -- banner_slot_inventory의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_slot_inventory_panel_id_fkey') THEN
        ALTER TABLE public.banner_slot_inventory DROP CONSTRAINT banner_slot_inventory_panel_id_fkey;
        ALTER TABLE public.banner_slot_inventory ADD CONSTRAINT banner_slot_inventory_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'banner_slot_inventory panel_id foreign key updated';
    END IF;
    
    -- banner_slot_price_policy의 banner_slot_id가 banner_slots.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'banner_slot_price_policy_banner_slot_id_fkey') THEN
        ALTER TABLE public.banner_slot_price_policy DROP CONSTRAINT banner_slot_price_policy_banner_slot_id_fkey;
        ALTER TABLE public.banner_slot_price_policy ADD CONSTRAINT banner_slot_price_policy_banner_slot_id_fkey 
            FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id);
        RAISE NOTICE 'banner_slot_price_policy banner_slot_id foreign key updated';
    END IF;
    
    -- led_display_inventory의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_display_inventory_panel_id_fkey') THEN
        ALTER TABLE public.led_display_inventory DROP CONSTRAINT led_display_inventory_panel_id_fkey;
        ALTER TABLE public.led_display_inventory ADD CONSTRAINT led_display_inventory_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'led_display_inventory panel_id foreign key updated';
    END IF;
    
    -- led_display_price_policy의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_display_price_policy_panel_id_fkey') THEN
        ALTER TABLE public.led_display_price_policy DROP CONSTRAINT led_display_price_policy_panel_id_fkey;
        ALTER TABLE public.led_display_price_policy ADD CONSTRAINT led_display_price_policy_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'led_display_price_policy panel_id foreign key updated';
    END IF;
    
    -- led_panel_details의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_panel_details_panel_id_fkey') THEN
        ALTER TABLE public.led_panel_details DROP CONSTRAINT led_panel_details_panel_id_fkey;
        ALTER TABLE public.led_panel_details ADD CONSTRAINT led_panel_details_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'led_panel_details panel_id foreign key updated';
    END IF;
    
    -- led_slots의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'led_slots_panel_id_fkey') THEN
        ALTER TABLE public.led_slots DROP CONSTRAINT led_slots_panel_id_fkey;
        ALTER TABLE public.led_slots ADD CONSTRAINT led_slots_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'led_slots panel_id foreign key updated';
    END IF;
    
    -- order_details의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'order_details_panel_id_fkey') THEN
        ALTER TABLE public.order_details DROP CONSTRAINT order_details_panel_id_fkey;
        ALTER TABLE public.order_details ADD CONSTRAINT order_details_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'order_details panel_id foreign key updated';
    END IF;
    
    -- panel_slot_usage의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_slot_usage_panel_id_fkey') THEN
        ALTER TABLE public.panel_slot_usage DROP CONSTRAINT panel_slot_usage_panel_id_fkey;
        ALTER TABLE public.panel_slot_usage ADD CONSTRAINT panel_slot_usage_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'panel_slot_usage panel_id foreign key updated';
    END IF;
    
    -- panel_slot_usage의 banner_slot_id가 banner_slots.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'panel_slot_usage_banner_slot_id_fkey') THEN
        ALTER TABLE public.panel_slot_usage DROP CONSTRAINT panel_slot_usage_banner_slot_id_fkey;
        ALTER TABLE public.panel_slot_usage ADD CONSTRAINT panel_slot_usage_banner_slot_id_fkey 
            FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id);
        RAISE NOTICE 'panel_slot_usage banner_slot_id foreign key updated';
    END IF;
    
    -- top_fixed_banner_inventory의 panel_id가 panels.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'top_fixed_banner_inventory_panel_id_fkey') THEN
        ALTER TABLE public.top_fixed_banner_inventory DROP CONSTRAINT top_fixed_banner_inventory_panel_id_fkey;
        ALTER TABLE public.top_fixed_banner_inventory ADD CONSTRAINT top_fixed_banner_inventory_panel_id_fkey 
            FOREIGN KEY (panel_id) REFERENCES public.panels(id);
        RAISE NOTICE 'top_fixed_banner_inventory panel_id foreign key updated';
    END IF;
    
    -- top_fixed_banner_inventory의 banner_slot_id가 banner_slots.id를 참조하도록
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'top_fixed_banner_inventory_banner_slot_id_fkey') THEN
        ALTER TABLE public.top_fixed_banner_inventory DROP CONSTRAINT top_fixed_banner_inventory_banner_slot_id_fkey;
        ALTER TABLE public.top_fixed_banner_inventory ADD CONSTRAINT top_fixed_banner_inventory_banner_slot_id_fkey 
            FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id);
        RAISE NOTICE 'top_fixed_banner_inventory banner_slot_id foreign key updated';
    END IF;
END $$;

-- ========================================
-- 6단계: 함수와 트리거 업데이트
-- ========================================

-- 기존 함수들을 새로운 테이블명으로 업데이트
DO $$ 
BEGIN
    -- check_inventory_before_order 함수 업데이트
    EXECUTE '
    CREATE OR REPLACE FUNCTION check_inventory_before_order()
    RETURNS TRIGGER AS $func$
    DECLARE
      period_id UUID;
      current_inventory RECORD;
    BEGIN
      -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
      SELECT rgdp.id INTO period_id
      FROM region_gu_display_periods rgdp
      JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
      WHERE pi.id = NEW.panel_id
        AND rgdp.display_type_id = pi.display_type_id
        AND (
          -- 기간이 완전히 겹치는 경우
          (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
          OR
          -- 기간이 부분적으로 겹치는 경우
          (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
        );
      
      -- 해당 기간의 재고 확인
      IF period_id IS NOT NULL THEN
        SELECT available_slots, total_slots INTO current_inventory
        FROM banner_slot_inventory
        WHERE panel_id = NEW.panel_id
          AND region_gu_display_period_id = period_id;
        
        -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
        IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
          RAISE EXCEPTION ''재고 부족: 요청 수량 %개, 가용 재고 %개 (기간: %)'', 
            NEW.slot_order_quantity, current_inventory.available_slots, period_id;
        END IF;
      ELSE
        -- 기간을 찾지 못한 경우 경고
        RAISE WARNING ''기간을 찾을 수 없음: panel_id=%, display_start_date=%, display_end_date=%'', 
          NEW.panel_id, NEW.display_start_date, NEW.display_end_date;
      END IF;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'check_inventory_before_order 함수 업데이트 완료';
END $$;

-- fill_panel_slot_snapshot_after_order_details 함수 업데이트
DO $$ 
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot_after_order_details()
    RETURNS TRIGGER AS $func$
    DECLARE
        v_panel_type TEXT;
        v_slot_record RECORD;
        v_snapshot JSONB;
    BEGIN
        -- 디버깅 로그
        RAISE NOTICE ''order_details 트리거 실행: order_id = %, panel_id = %'', 
            NEW.order_id, NEW.panel_id;
        
        -- panel_id가 없으면 처리하지 않음
        IF NEW.panel_id IS NULL THEN
            RAISE NOTICE ''panel_id가 NULL이므로 처리 중단'';
            RETURN NEW;
        END IF;
        
        -- 패널 타입 확인
        SELECT dt.name INTO v_panel_type
        FROM panels pi
        JOIN display_types dt ON pi.display_type_id = dt.id
        WHERE pi.id = NEW.panel_id;
        
        RAISE NOTICE ''패널 타입: %'', v_panel_type;
        
        -- 패널 타입에 따라 슬롯 정보 조회
        IF v_panel_type = ''banner_display'' THEN
            -- 배너 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
            IF NEW.panel_slot_usage_id IS NOT NULL THEN
                -- panel_slot_usage가 있으면 해당 슬롯 사용 (banner_slot_price_policy 포함)
                SELECT 
                    bsi.*,
                    bsp.total_price as policy_total_price,
                    bsp.tax_price as policy_tax_price,
                    bsp.road_usage_fee as policy_road_usage_fee,
                    bsp.advertising_fee as policy_advertising_fee
                INTO v_slot_record 
                FROM panel_slot_usage psu
                JOIN banner_slots bsi ON psu.banner_slot_id = bsi.id
                LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_id 
                    AND bsp.price_usage_type = ''default''  -- 기본값, 필요시 사용자 타입에 따라 변경
                WHERE psu.id = NEW.panel_slot_usage_id;
                
                RAISE NOTICE ''배너 슬롯 조회 (panel_slot_usage): slot_number = %, id = %, policy_total_price = %'', 
                    v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
            ELSE
                -- panel_slot_usage가 없으면 1번 슬롯 사용 (banner_slot_price_policy 포함)
                SELECT 
                    bsi.*,
                    bsp.total_price as policy_total_price,
                    bsp.tax_price as policy_tax_price,
                    bsp.road_usage_fee as policy_road_usage_fee,
                    bsp.advertising_fee as policy_advertising_fee
                INTO v_slot_record 
                FROM banner_slots bsi
                LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_id 
                    AND bsp.price_usage_type = ''default''  -- 기본값, 필요시 사용자 타입에 따라 변경
                WHERE bsi.panel_id = NEW.panel_id
                  AND bsi.slot_number = 1;
                
                RAISE NOTICE ''배너 슬롯 조회 (기본값): slot_number = %, id = %, policy_total_price = %'', 
                    v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
            END IF;
                
        ELSIF v_panel_type = ''led_display'' THEN
            -- LED 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
            IF NEW.panel_slot_usage_id IS NOT NULL THEN
                -- panel_slot_usage가 있으면 해당 슬롯 사용
                SELECT lsi.* INTO v_slot_record 
                FROM panel_slot_usage psu
                JOIN led_slots lsi ON psu.panel_id = lsi.panel_id 
                    AND psu.slot_number = lsi.slot_number
                WHERE psu.id = NEW.panel_slot_usage_id;
                
                RAISE NOTICE ''LED 슬롯 조회 (panel_slot_usage): slot_number = %, id = %'', 
                    v_slot_record.slot_number, v_slot_record.id;
            ELSE
                -- panel_slot_usage가 없으면 1번 슬롯 사용
                SELECT * INTO v_slot_record 
                FROM led_slots
                WHERE panel_id = NEW.panel_id
                  AND slot_number = 1;
                
                RAISE NOTICE ''LED 슬롯 조회 (기본값): slot_number = %, id = %'', 
                    v_slot_record.slot_number, v_slot_record.id;
            END IF;
        ELSE
            RAISE NOTICE ''알 수 없는 패널 타입: %'', v_panel_type;
            RETURN NEW;
        END IF;
        
        -- 슬롯 정보가 없으면 처리하지 않음
        IF v_slot_record.id IS NULL THEN
            RAISE NOTICE ''슬롯 정보를 찾을 수 없으므로 처리 중단'';
            RETURN NEW;
        END IF;
        
        -- JSONB 스냅샷 생성
        v_snapshot := to_jsonb(v_slot_record);
        
        RAISE NOTICE ''생성된 스냅샷: %'', v_snapshot;
        
        -- orders 테이블의 panel_slot_snapshot 업데이트
        UPDATE orders 
        SET panel_slot_snapshot = v_snapshot
        WHERE id = NEW.order_id;
        
        RAISE NOTICE ''panel_slot_snapshot 업데이트 완료: 주문 ID %'', NEW.order_id;
        
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'fill_panel_slot_snapshot_after_order_details 함수 업데이트 완료';
END $$;

-- prevent_duplicate_banner_booking 함수 업데이트
DO $$ 
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION prevent_duplicate_banner_booking()
    RETURNS TRIGGER AS $func$
    DECLARE
      conflicting_usage RECORD;
    BEGIN
      -- banner_type이 ''top_fixed''가 아닌 경우에만 중복 확인 (일반 현수막게시대)
      IF NEW.banner_type != ''top_fixed'' THEN
        -- 같은 패널의 같은 슬롯이 같은 기간에 이미 예약되어 있는지 확인
        SELECT ps.id INTO conflicting_usage
        FROM panel_slot_usage ps
        WHERE ps.panel_id = NEW.panel_id
          AND ps.slot_number = NEW.slot_number
          AND ps.is_active = true
          AND ps.is_closed = false
          AND ps.banner_type != ''top_fixed''
          AND (
            (ps.attach_date_from <= NEW.attach_date_from AND ps.attach_date_from + INTERVAL ''15 days'' >= NEW.attach_date_from)
            OR (ps.attach_date_from >= NEW.attach_date_from AND ps.attach_date_from <= NEW.attach_date_from + INTERVAL ''15 days'')
          );
        
        IF FOUND THEN
          RAISE EXCEPTION ''선택한 기간에 이미 예약된 슬롯입니다. (conflicting_usage_id: %)'', conflicting_usage.id;
        END IF;
      END IF;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'prevent_duplicate_banner_booking 함수 업데이트 완료';
END $$;

-- restore_banner_slot_inventory_on_order_delete 함수 업데이트
DO $$ 
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
    RETURNS TRIGGER AS $func$
    DECLARE
      period_id UUID;
    BEGIN
      -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
      SELECT rgdp.id INTO period_id
      FROM region_gu_display_periods rgdp
      JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
      WHERE pi.id = OLD.panel_id
        AND rgdp.display_type_id = pi.display_type_id
        AND (
          -- 기간이 완전히 겹치는 경우
          (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
          OR
          -- 기간이 부분적으로 겹치는 경우
          (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
        );
      
      -- 해당 기간의 재고 복구
      IF period_id IS NOT NULL THEN
        UPDATE banner_slot_inventory 
        SET 
          available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
          closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
          updated_at = NOW()
        WHERE panel_id = OLD.panel_id
          AND region_gu_display_period_id = period_id;
      END IF;
      
      RETURN OLD;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'restore_banner_slot_inventory_on_order_delete 함수 업데이트 완료';
END $$;

-- update_banner_slot_inventory_on_order 함수 업데이트
DO $$ 
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
    RETURNS TRIGGER AS $func$
    DECLARE
      period_id UUID;
      panel_record RECORD;
    BEGIN
      -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
      SELECT rgdp.id INTO period_id
      FROM region_gu_display_periods rgdp
      JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
      WHERE pi.id = NEW.panel_id
        AND rgdp.display_type_id = pi.display_type_id
        AND (
          -- 기간이 완전히 겹치는 경우
          (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
          OR
          -- 기간이 부분적으로 겹치는 경우
          (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
        );
      
      -- 해당 기간의 재고 업데이트
      IF period_id IS NOT NULL THEN
        UPDATE banner_slot_inventory 
        SET 
          available_slots = GREATEST(0, available_slots - NEW.slot_order_quantity),
          closed_slots = closed_slots + NEW.slot_order_quantity,
          updated_at = NOW()
        WHERE panel_id = NEW.panel_id
          AND region_gu_display_period_id = period_id;
        
        -- 재고 정보가 없으면 새로 생성
        IF NOT FOUND THEN
          SELECT * INTO panel_record FROM panels WHERE id = NEW.panel_id;
          INSERT INTO banner_slot_inventory (
            panel_id,
            region_gu_display_period_id,
            total_slots,
            available_slots,
            closed_slots
          )
          VALUES (
            NEW.panel_id,
            period_id,
            panel_record.max_banner,
            GREATEST(0, panel_record.max_banner - NEW.slot_order_quantity),
            NEW.slot_order_quantity
          );
        END IF;
      ELSE
        -- 기간을 찾지 못한 경우 로그 출력 (디버깅용)
        RAISE NOTICE ''기간을 찾을 수 없음: panel_id=%, display_start_date=%, display_end_date=%'', 
          NEW.panel_id, NEW.display_start_date, NEW.display_end_date;
      END IF;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'update_banner_slot_inventory_on_order 함수 업데이트 완료';
END $$;

-- update_top_fixed_banner_inventory 함수 업데이트
DO $$ 
BEGIN
    EXECUTE '
    CREATE OR REPLACE FUNCTION update_top_fixed_banner_inventory()
    RETURNS TRIGGER AS $func$
    BEGIN
      -- Check if this is a top-fixed banner (slot_number = 0)
      IF EXISTS (
        SELECT 1 FROM banner_slots 
        WHERE id = NEW.banner_slot_id 
        AND slot_number = 0
        AND banner_type = ''top_fixed''
      ) THEN
        -- Update top_fixed_banner_inventory to mark all periods as unavailable for this panel
        UPDATE top_fixed_banner_inventory 
        SET available_slots = 0,
            updated_at = NOW()
        WHERE panel_id = NEW.panel_id;
      END IF;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;';
    
    RAISE NOTICE 'update_top_fixed_banner_inventory 함수 업데이트 완료';
END $$;

-- ========================================
-- 7단계: 트리거 이름 업데이트
-- ========================================

-- 트리거 이름 변경
DO $$ 
BEGIN
    -- update_panel_info_updated_at → update_panels_updated_at
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_panel_info_updated_at') THEN
        ALTER TRIGGER update_panel_info_updated_at ON panels RENAME TO update_panels_updated_at;
        RAISE NOTICE 'update_panel_info_updated_at 트리거 이름을 update_panels_updated_at으로 변경';
    END IF;
    
    -- update_banner_slot_info_updated_at → update_banner_slots_updated_at
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_banner_slot_info_updated_at') THEN
        ALTER TRIGGER update_banner_slot_info_updated_at ON banner_slots RENAME TO update_banner_slots_updated_at;
        RAISE NOTICE 'update_banner_slot_info_updated_at 트리거 이름을 update_banner_slots_updated_at으로 변경';
    END IF;
    
    -- update_led_slot_info_updated_at → update_led_slots_updated_at
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_led_slot_info_updated_at') THEN
        ALTER TRIGGER update_led_slot_info_updated_at ON led_slots RENAME TO update_led_slots_updated_at;
        RAISE NOTICE 'update_led_slot_info_updated_at 트리거 이름을 update_led_slots_updated_at으로 변경';
    END IF;
END $$;

-- ========================================
-- 8단계: 인덱스 재생성
-- ========================================

-- 인덱스 재생성 (기존 인덱스 삭제 후 새로 생성)
DO $$ 
BEGIN
    -- 기존 인덱스 삭제
    DROP INDEX IF EXISTS idx_banner_slot_inventory_panel_info_id;
    DROP INDEX IF EXISTS idx_panel_slot_usage_panel_info_active;
    DROP INDEX IF EXISTS idx_order_details_panel_info_id;
    
    -- 새 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_banner_slot_inventory_panel_id ON banner_slot_inventory(panel_id);
    CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_panel_active ON panel_slot_usage(panel_id, is_active, is_closed, banner_type);
    CREATE INDEX IF NOT EXISTS idx_order_details_panel_id ON order_details(panel_id);
    
    RAISE NOTICE '인덱스 재생성 완료';
END $$;

-- ========================================
-- 9단계: 변경 완료 확인
-- ========================================
SELECT 
    'Rename operation completed' as status,
    COUNT(*) as renamed_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bank_accounts', 'banner_slots', 'led_slots', 'panels');

-- 변경된 테이블 목록 확인
SELECT 
    table_name,
    'Renamed table' as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bank_accounts', 'banner_slots', 'led_slots', 'panels')
ORDER BY table_name;

-- 함수 업데이트 확인
SELECT 
    routine_name,
    'Updated function' as description
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'check_inventory_before_order',
        'fill_panel_slot_snapshot_after_order_details',
        'prevent_duplicate_banner_booking',
        'restore_banner_slot_inventory_on_order_delete',
        'update_banner_slot_inventory_on_order',
        'update_top_fixed_banner_inventory'
    )
ORDER BY routine_name; 