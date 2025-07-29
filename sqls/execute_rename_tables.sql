-- 🚨 실행 전 주의사항 🚨
-- 1. 반드시 백업을 먼저 받으세요!
-- 2. 테스트 환경에서 먼저 실행해보세요!
-- 3. 애플리케이션 코드도 함께 업데이트해야 합니다!

-- 📋 실행 순서:
-- 1. 이 파일의 내용을 Supabase SQL Editor에 복사
-- 2. 실행 버튼 클릭
-- 3. 결과 확인

-- 🔍 1단계: 현재 상태 확인
DO $$
BEGIN
    RAISE NOTICE '=== 현재 테이블 상태 확인 ===';
    
    -- 기존 테이블 확인
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_info') THEN
        RAISE NOTICE 'bank_info 테이블 존재';
    ELSE
        RAISE NOTICE 'bank_info 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'panel_info') THEN
        RAISE NOTICE 'panel_info 테이블 존재';
    ELSE
        RAISE NOTICE 'panel_info 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banner_slot_info') THEN
        RAISE NOTICE 'banner_slot_info 테이블 존재';
    ELSE
        RAISE NOTICE 'banner_slot_info 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'led_slot_info') THEN
        RAISE NOTICE 'led_slot_info 테이블 존재';
    ELSE
        RAISE NOTICE 'led_slot_info 테이블 없음';
    END IF;
END $$;

-- ⚡ 2단계: 테이블명 변경
DO $$
BEGIN
    RAISE NOTICE '=== 테이블명 변경 시작 ===';
    
    -- bank_info → bank_accounts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_info') THEN
        ALTER TABLE public.bank_info RENAME TO bank_accounts;
        RAISE NOTICE 'bank_info → bank_accounts 변경 완료';
    ELSE
        RAISE NOTICE 'bank_info 테이블이 없어서 건너뜀';
    END IF;
    
    -- panel_info → panels
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'panel_info') THEN
        ALTER TABLE public.panel_info RENAME TO panels;
        RAISE NOTICE 'panel_info → panels 변경 완료';
    ELSE
        RAISE NOTICE 'panel_info 테이블이 없어서 건너뜀';
    END IF;
    
    -- banner_slot_info → banner_slots
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banner_slot_info') THEN
        ALTER TABLE public.banner_slot_info RENAME TO banner_slots;
        RAISE NOTICE 'banner_slot_info → banner_slots 변경 완료';
    ELSE
        RAISE NOTICE 'banner_slot_info 테이블이 없어서 건너뜀';
    END IF;
    
    -- led_slot_info → led_slots
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'led_slot_info') THEN
        ALTER TABLE public.led_slot_info RENAME TO led_slots;
        RAISE NOTICE 'led_slot_info → led_slots 변경 완료';
    ELSE
        RAISE NOTICE 'led_slot_info 테이블이 없어서 건너뜀';
    END IF;
END $$;

-- 🔧 3단계: 컬럼명 변경
DO $$
BEGIN
    RAISE NOTICE '=== 컬럼명 변경 시작 ===';
    
    -- panel_info_id → panel_id (orders 테이블)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.orders RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'orders.panel_info_id → panel_id 변경 완료';
    ELSE
        RAISE NOTICE 'orders.panel_info_id 컬럼이 없어서 건너뜀';
    END IF;
    
    -- panel_info_id → panel_id (order_details 테이블)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'order_details' AND column_name = 'panel_info_id') THEN
        ALTER TABLE public.order_details RENAME COLUMN panel_info_id TO panel_id;
        RAISE NOTICE 'order_details.panel_info_id → panel_id 변경 완료';
    ELSE
        RAISE NOTICE 'order_details.panel_info_id 컬럼이 없어서 건너뜀';
    END IF;
    
    -- banner_slot_info_id → banner_slot_id (panel_slot_usage 테이블)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'panel_slot_usage' AND column_name = 'banner_slot_info_id') THEN
        ALTER TABLE public.panel_slot_usage RENAME COLUMN banner_slot_info_id TO banner_slot_id;
        RAISE NOTICE 'panel_slot_usage.banner_slot_info_id → banner_slot_id 변경 완료';
    ELSE
        RAISE NOTICE 'panel_slot_usage.banner_slot_info_id 컬럼이 없어서 건너뜀';
    END IF;
END $$;

-- 🔍 4단계: 변경 결과 확인
DO $$
BEGIN
    RAISE NOTICE '=== 변경 결과 확인 ===';
    
    -- 새 테이블명 확인
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_accounts') THEN
        RAISE NOTICE '✅ bank_accounts 테이블 존재';
    ELSE
        RAISE NOTICE '❌ bank_accounts 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'panels') THEN
        RAISE NOTICE '✅ panels 테이블 존재';
    ELSE
        RAISE NOTICE '❌ panels 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banner_slots') THEN
        RAISE NOTICE '✅ banner_slots 테이블 존재';
    ELSE
        RAISE NOTICE '❌ banner_slots 테이블 없음';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'led_slots') THEN
        RAISE NOTICE '✅ led_slots 테이블 존재';
    ELSE
        RAISE NOTICE '❌ led_slots 테이블 없음';
    END IF;
    
    RAISE NOTICE '=== 변경 작업 완료 ===';
    RAISE NOTICE '⚠️  다음 단계: 애플리케이션 코드 업데이트 필요!';
END $$; 