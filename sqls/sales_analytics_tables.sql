-- 판매 히스토리와 트렌드 분석을 위한 새로운 테이블들을 생성하는 SQL 스크립트를 작성합니다.

-- 1. 월별 판매 통계 테이블 (자동 집계)
CREATE TABLE IF NOT EXISTS monthly_sales_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL, -- '2025년 8월' 형식
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  region_gu_id uuid NOT NULL,
  display_type_id uuid NOT NULL,
  period_type TEXT NOT NULL, -- 'first_half', 'second_half', 'full_month'
  
  -- 주문 통계
  total_orders INTEGER DEFAULT 0,
  total_slots_ordered INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  
  -- 고객 유형별 통계
  individual_orders INTEGER DEFAULT 0,
  individual_slots INTEGER DEFAULT 0,
  individual_revenue NUMERIC DEFAULT 0,
  
  corporate_orders INTEGER DEFAULT 0,
  corporate_slots INTEGER DEFAULT 0,
  corporate_revenue NUMERIC DEFAULT 0,
  
  public_institution_orders INTEGER DEFAULT 0,
  public_institution_slots INTEGER DEFAULT 0,
  public_institution_revenue NUMERIC DEFAULT 0,
  
  -- 가격 정책별 통계
  default_price_orders INTEGER DEFAULT 0,
  default_price_revenue NUMERIC DEFAULT 0,
  
  public_institution_price_orders INTEGER DEFAULT 0,
  public_institution_price_revenue NUMERIC DEFAULT 0,
  
  re_order_orders INTEGER DEFAULT 0,
  re_order_revenue NUMERIC DEFAULT 0,
  
  self_install_orders INTEGER DEFAULT 0,
  self_install_revenue NUMERIC DEFAULT 0,
  
  -- 재고 통계
  total_inventory_slots INTEGER DEFAULT 0,
  sold_slots INTEGER DEFAULT 0,
  availability_rate NUMERIC DEFAULT 0, -- (available_slots / total_slots) * 100
  
  -- 패널별 통계
  active_panels INTEGER DEFAULT 0,
  sold_out_panels INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT monthly_sales_statistics_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_sales_statistics_unique UNIQUE (year_month, region_gu_id, display_type_id, period_type),
  CONSTRAINT monthly_sales_statistics_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT monthly_sales_statistics_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id)
);

-- 2. 패널별 판매 히스토리 테이블
CREATE TABLE IF NOT EXISTS panel_sales_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  year_month TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  period_type TEXT NOT NULL,
  
  -- 판매 통계
  total_orders INTEGER DEFAULT 0,
  total_slots_sold INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  
  -- 고객 유형별
  individual_customers INTEGER DEFAULT 0,
  corporate_customers INTEGER DEFAULT 0,
  public_institution_customers INTEGER DEFAULT 0,
  
  -- 인기도 지표
  peak_demand_days INTEGER DEFAULT 0, -- 재고가 0이었던 날짜 수
  average_daily_orders NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT panel_sales_history_pkey PRIMARY KEY (id),
  CONSTRAINT panel_sales_history_unique UNIQUE (panel_info_id, year_month, period_type),
  CONSTRAINT panel_sales_history_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);

-- 3. 고객 유형별 트렌드 분석 테이블
CREATE TABLE IF NOT EXISTS customer_type_trends (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year_month TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  region_gu_id uuid,
  
  -- 고객 유형별 통계
  customer_type TEXT NOT NULL, -- 'individual', 'corporate', 'public_institution'
  
  total_orders INTEGER DEFAULT 0,
  total_slots INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_order_value NUMERIC DEFAULT 0,
  
  -- 선호도 분석
  preferred_period TEXT, -- 'first_half', 'second_half'
  preferred_panel_types TEXT[], -- ['panel', 'multi_panel', 'lower_panel']
  
  -- 성장률 (이전 달 대비)
  order_growth_rate NUMERIC DEFAULT 0,
  revenue_growth_rate NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT customer_type_trends_pkey PRIMARY KEY (id),
  CONSTRAINT customer_type_trends_unique UNIQUE (year_month, region_gu_id, customer_type),
  CONSTRAINT customer_type_trends_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_monthly_sales_statistics_year_month 
ON monthly_sales_statistics(year_month);

CREATE INDEX IF NOT EXISTS idx_monthly_sales_statistics_region 
ON monthly_sales_statistics(region_gu_id, year, month);

CREATE INDEX IF NOT EXISTS idx_panel_sales_history_panel 
ON panel_sales_history(panel_info_id, year, month);

CREATE INDEX IF NOT EXISTS idx_customer_type_trends_year_month 
ON customer_type_trends(year_month, customer_type);

-- 5. 월별 통계 자동 집계 함수
CREATE OR REPLACE FUNCTION aggregate_monthly_sales_statistics(target_year_month TEXT DEFAULT NULL)
RETURNS void AS $$
DECLARE
    target_year INTEGER;
    target_month INTEGER;
    period_record RECORD;
    order_stats RECORD;
    inventory_stats RECORD;
    customer_stats RECORD;
BEGIN
    -- 대상 년월 설정
    IF target_year_month IS NULL THEN
        target_year_month := EXTRACT(YEAR FROM CURRENT_DATE) || '년 ' || EXTRACT(MONTH FROM CURRENT_DATE) || '월';
    END IF;
    
    target_year := EXTRACT(YEAR FROM (target_year_month || '-01')::DATE);
    target_month := EXTRACT(MONTH FROM (target_year_month || '-01')::DATE);
    
    RAISE NOTICE '월별 판매 통계 집계 시작: %', target_year_month;
    
    -- 각 기간별로 통계 집계
    FOR period_record IN 
        SELECT 
            rgdp.id as period_id,
            rgdp.year_month,
            rgdp.period as period_type,
            rgdp.region_gu_id,
            rgdp.display_type_id,
            rgu.name as region_name,
            dt.name as display_type_name
        FROM region_gu_display_periods rgdp
        JOIN region_gu rgu ON rgu.id = rgdp.region_gu_id
        JOIN display_types dt ON dt.id = rgdp.display_type_id
        WHERE rgdp.year_month = target_year_month
    LOOP
        -- 주문 통계 집계
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(od.slot_order_quantity), 0) as total_slots_ordered,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            
            -- 고객 유형별 주문 수
            COUNT(DISTINCT CASE WHEN up.is_public_institution = true THEN o.id END) as public_institution_orders,
            COUNT(DISTINCT CASE WHEN up.is_company = true THEN o.id END) as corporate_orders,
            COUNT(DISTINCT CASE WHEN up.is_public_institution = false AND up.is_company = false THEN o.id END) as individual_orders,
            
            -- 고객 유형별 슬롯 수
            COALESCE(SUM(CASE WHEN up.is_public_institution = true THEN od.slot_order_quantity ELSE 0 END), 0) as public_institution_slots,
            COALESCE(SUM(CASE WHEN up.is_company = true THEN od.slot_order_quantity ELSE 0 END), 0) as corporate_slots,
            COALESCE(SUM(CASE WHEN up.is_public_institution = false AND up.is_company = false THEN od.slot_order_quantity ELSE 0 END), 0) as individual_slots,
            
            -- 고객 유형별 매출
            COALESCE(SUM(CASE WHEN up.is_public_institution = true THEN p.amount ELSE 0 END), 0) as public_institution_revenue,
            COALESCE(SUM(CASE WHEN up.is_company = true THEN p.amount ELSE 0 END), 0) as corporate_revenue,
            COALESCE(SUM(CASE WHEN up.is_public_institution = false AND up.is_company = false THEN p.amount ELSE 0 END), 0) as individual_revenue
        INTO order_stats
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        LEFT JOIN user_profiles up ON o.user_profile_id = up.id
        LEFT JOIN payments p ON o.id = p.order_id
        JOIN panel_info pi ON od.panel_info_id = pi.id
        WHERE pi.region_gu_id = period_record.region_gu_id
          AND pi.display_type_id = period_record.display_type_id
          AND od.display_start_date >= period_record.period_from
          AND od.display_end_date <= period_record.period_to
          AND o.order_status IN ('completed', 'paid');
        
        -- 재고 통계 집계
        SELECT 
            COALESCE(SUM(bsi.total_slots), 0) as total_inventory_slots,
            COALESCE(SUM(bsi.closed_slots), 0) as sold_slots,
            COALESCE(SUM(bsi.available_slots), 0) as available_slots,
            COUNT(pi.id) as active_panels,
            COUNT(CASE WHEN bsi.available_slots = 0 THEN 1 END) as sold_out_panels
        INTO inventory_stats
        FROM banner_slot_inventory bsi
        JOIN panel_info pi ON pi.id = bsi.panel_info_id
        WHERE bsi.region_gu_display_period_id = period_record.period_id;
        
        -- 가용률 계산
        IF inventory_stats.total_inventory_slots > 0 THEN
            inventory_stats.availability_rate := (inventory_stats.available_slots::NUMERIC / inventory_stats.total_inventory_slots) * 100;
        ELSE
            inventory_stats.availability_rate := 0;
        END IF;
        
        -- 통계 데이터 삽입/업데이트
        INSERT INTO monthly_sales_statistics (
            year_month, year, month, region_gu_id, display_type_id, period_type,
            total_orders, total_slots_ordered, total_revenue,
            individual_orders, individual_slots, individual_revenue,
            corporate_orders, corporate_slots, corporate_revenue,
            public_institution_orders, public_institution_slots, public_institution_revenue,
            total_inventory_slots, sold_slots, availability_rate,
            active_panels, sold_out_panels
        )
        VALUES (
            period_record.year_month, target_year, target_month, 
            period_record.region_gu_id, period_record.display_type_id, period_record.period_type,
            COALESCE(order_stats.total_orders, 0), COALESCE(order_stats.total_slots_ordered, 0), COALESCE(order_stats.total_revenue, 0),
            COALESCE(order_stats.individual_orders, 0), COALESCE(order_stats.individual_slots, 0), COALESCE(order_stats.individual_revenue, 0),
            COALESCE(order_stats.corporate_orders, 0), COALESCE(order_stats.corporate_slots, 0), COALESCE(order_stats.corporate_revenue, 0),
            COALESCE(order_stats.public_institution_orders, 0), COALESCE(order_stats.public_institution_slots, 0), COALESCE(order_stats.public_institution_revenue, 0),
            COALESCE(inventory_stats.total_inventory_slots, 0), COALESCE(inventory_stats.sold_slots, 0), COALESCE(inventory_stats.availability_rate, 0),
            COALESCE(inventory_stats.active_panels, 0), COALESCE(inventory_stats.sold_out_panels, 0)
        )
        ON CONFLICT (year_month, region_gu_id, display_type_id, period_type)
        DO UPDATE SET
            total_orders = EXCLUDED.total_orders,
            total_slots_ordered = EXCLUDED.total_slots_ordered,
            total_revenue = EXCLUDED.total_revenue,
            individual_orders = EXCLUDED.individual_orders,
            individual_slots = EXCLUDED.individual_slots,
            individual_revenue = EXCLUDED.individual_revenue,
            corporate_orders = EXCLUDED.corporate_orders,
            corporate_slots = EXCLUDED.corporate_slots,
            corporate_revenue = EXCLUDED.corporate_revenue,
            public_institution_orders = EXCLUDED.public_institution_orders,
            public_institution_slots = EXCLUDED.public_institution_slots,
            public_institution_revenue = EXCLUDED.public_institution_revenue,
            total_inventory_slots = EXCLUDED.total_inventory_slots,
            sold_slots = EXCLUDED.sold_slots,
            availability_rate = EXCLUDED.availability_rate,
            active_panels = EXCLUDED.active_panels,
            sold_out_panels = EXCLUDED.sold_out_panels,
            updated_at = now();
        
        RAISE NOTICE '구 % % % 통계 집계 완료', 
            period_record.region_name, period_record.display_type_name, period_record.period_type;
    END LOOP;
    
    RAISE NOTICE '월별 판매 통계 집계 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 6. 패널별 판매 히스토리 집계 함수
CREATE OR REPLACE FUNCTION aggregate_panel_sales_history(target_year_month TEXT DEFAULT NULL)
RETURNS void AS $$
DECLARE
    panel_record RECORD;
    sales_stats RECORD;
BEGIN
    -- 대상 년월 설정
    IF target_year_month IS NULL THEN
        target_year_month := EXTRACT(YEAR FROM CURRENT_DATE) || '년 ' || EXTRACT(MONTH FROM CURRENT_DATE) || '월';
    END IF;
    
    RAISE NOTICE '패널별 판매 히스토리 집계 시작: %', target_year_month;
    
    -- 각 패널별로 통계 집계
    FOR panel_record IN 
        SELECT 
            pi.id as panel_info_id,
            pi.nickname as panel_name,
            rgu.name as region_name,
            rgdp.period as period_type
        FROM panel_info pi
        JOIN region_gu rgu ON rgu.id = pi.region_gu_id
        JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = pi.region_gu_id
        WHERE rgdp.year_month = target_year_month
          AND pi.panel_status = 'active'
    LOOP
        -- 판매 통계 집계
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(od.slot_order_quantity), 0) as total_slots_sold,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            
            -- 고객 유형별 고객 수
            COUNT(DISTINCT CASE WHEN up.is_public_institution = true THEN o.user_profile_id END) as public_institution_customers,
            COUNT(DISTINCT CASE WHEN up.is_company = true THEN o.user_profile_id END) as corporate_customers,
            COUNT(DISTINCT CASE WHEN up.is_public_institution = false AND up.is_company = false THEN o.user_profile_id END) as individual_customers
        INTO sales_stats
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        LEFT JOIN user_profiles up ON o.user_profile_id = up.id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE od.panel_info_id = panel_record.panel_info_id
          AND o.order_status IN ('completed', 'paid');
        
        -- 패널별 판매 히스토리 삽입/업데이트
        INSERT INTO panel_sales_history (
            panel_info_id, year_month, year, month, period_type,
            total_orders, total_slots_sold, total_revenue,
            individual_customers, corporate_customers, public_institution_customers
        )
        VALUES (
            panel_record.panel_info_id, target_year_month, 
            EXTRACT(YEAR FROM (target_year_month || '-01')::DATE),
            EXTRACT(MONTH FROM (target_year_month || '-01')::DATE),
            panel_record.period_type,
            COALESCE(sales_stats.total_orders, 0), COALESCE(sales_stats.total_slots_sold, 0), COALESCE(sales_stats.total_revenue, 0),
            COALESCE(sales_stats.individual_customers, 0), COALESCE(sales_stats.corporate_customers, 0), COALESCE(sales_stats.public_institution_customers, 0)
        )
        ON CONFLICT (panel_info_id, year_month, period_type)
        DO UPDATE SET
            total_orders = EXCLUDED.total_orders,
            total_slots_sold = EXCLUDED.total_slots_sold,
            total_revenue = EXCLUDED.total_revenue,
            individual_customers = EXCLUDED.individual_customers,
            corporate_customers = EXCLUDED.corporate_customers,
            public_institution_customers = EXCLUDED.public_institution_customers,
            updated_at = now();
    END LOOP;
    
    RAISE NOTICE '패널별 판매 히스토리 집계 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 7. 고객 유형별 트렌드 분석 함수
CREATE OR REPLACE FUNCTION analyze_customer_type_trends(target_year_month TEXT DEFAULT NULL)
RETURNS void AS $$
DECLARE
    customer_type_record RECORD;
    trend_stats RECORD;
    prev_month_stats RECORD;
BEGIN
    -- 대상 년월 설정
    IF target_year_month IS NULL THEN
        target_year_month := EXTRACT(YEAR FROM CURRENT_DATE) || '년 ' || EXTRACT(MONTH FROM CURRENT_DATE) || '월';
    END IF;
    
    RAISE NOTICE '고객 유형별 트렌드 분석 시작: %', target_year_month;
    
    -- 각 고객 유형별로 분석
    FOR customer_type_record IN 
        SELECT DISTINCT 
            'individual' as customer_type
        UNION ALL
        SELECT 'corporate'
        UNION ALL
        SELECT 'public_institution'
    LOOP
        -- 현재 월 통계
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(od.slot_order_quantity), 0) as total_slots,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            COALESCE(AVG(p.amount), 0) as average_order_value
        INTO trend_stats
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        LEFT JOIN user_profiles up ON o.user_profile_id = up.id
        LEFT JOIN payments p ON o.id = p.order_id
        JOIN panel_info pi ON od.panel_info_id = pi.id
        JOIN region_gu_display_periods rgdp ON pi.region_gu_id = rgdp.region_gu_id
        WHERE rgdp.year_month = target_year_month
          AND o.order_status IN ('completed', 'paid')
          AND CASE 
                WHEN customer_type_record.customer_type = 'individual' THEN up.is_public_institution = false AND up.is_company = false
                WHEN customer_type_record.customer_type = 'corporate' THEN up.is_company = true
                WHEN customer_type_record.customer_type = 'public_institution' THEN up.is_public_institution = true
              END;
        
        -- 이전 월 통계 (성장률 계산용)
        SELECT 
            COUNT(DISTINCT o.id) as prev_orders,
            COALESCE(SUM(p.amount), 0) as prev_revenue
        INTO prev_month_stats
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        LEFT JOIN user_profiles up ON o.user_profile_id = up.id
        LEFT JOIN payments p ON o.id = p.order_id
        JOIN panel_info pi ON od.panel_info_id = pi.id
        JOIN region_gu_display_periods rgdp ON pi.region_gu_id = rgdp.region_gu_id
        WHERE rgdp.year_month = (EXTRACT(YEAR FROM (target_year_month || '-01')::DATE - INTERVAL '1 month') || '년 ' || 
                                EXTRACT(MONTH FROM (target_year_month || '-01')::DATE - INTERVAL '1 month') || '월')
          AND o.order_status IN ('completed', 'paid')
          AND CASE 
                WHEN customer_type_record.customer_type = 'individual' THEN up.is_public_institution = false AND up.is_company = false
                WHEN customer_type_record.customer_type = 'corporate' THEN up.is_company = true
                WHEN customer_type_record.customer_type = 'public_institution' THEN up.is_public_institution = true
              END;
        
        -- 성장률 계산
        IF prev_month_stats.prev_orders > 0 THEN
            trend_stats.order_growth_rate := ((trend_stats.total_orders - prev_month_stats.prev_orders)::NUMERIC / prev_month_stats.prev_orders) * 100;
        ELSE
            trend_stats.order_growth_rate := 0;
        END IF;
        
        IF prev_month_stats.prev_revenue > 0 THEN
            trend_stats.revenue_growth_rate := ((trend_stats.total_revenue - prev_month_stats.prev_revenue)::NUMERIC / prev_month_stats.prev_revenue) * 100;
        ELSE
            trend_stats.revenue_growth_rate := 0;
        END IF;
        
        -- 트렌드 데이터 삽입/업데이트
        INSERT INTO customer_type_trends (
            year_month, year, month, customer_type,
            total_orders, total_slots, total_revenue, average_order_value,
            order_growth_rate, revenue_growth_rate
        )
        VALUES (
            target_year_month,
            EXTRACT(YEAR FROM (target_year_month || '-01')::DATE),
            EXTRACT(MONTH FROM (target_year_month || '-01')::DATE),
            customer_type_record.customer_type,
            COALESCE(trend_stats.total_orders, 0), COALESCE(trend_stats.total_slots, 0), 
            COALESCE(trend_stats.total_revenue, 0), COALESCE(trend_stats.average_order_value, 0),
            COALESCE(trend_stats.order_growth_rate, 0), COALESCE(trend_stats.revenue_growth_rate, 0)
        )
        ON CONFLICT (year_month, region_gu_id, customer_type)
        DO UPDATE SET
            total_orders = EXCLUDED.total_orders,
            total_slots = EXCLUDED.total_slots,
            total_revenue = EXCLUDED.total_revenue,
            average_order_value = EXCLUDED.average_order_value,
            order_growth_rate = EXCLUDED.order_growth_rate,
            revenue_growth_rate = EXCLUDED.revenue_growth_rate,
            updated_at = now();
    END LOOP;
    
    RAISE NOTICE '고객 유형별 트렌드 분석 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 8. 통합 분석 함수 (모든 통계를 한번에 집계)
CREATE OR REPLACE FUNCTION generate_sales_analytics(target_year_month TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    RAISE NOTICE '판매 분석 데이터 생성 시작: %', target_year_month;
    
    -- 1. 월별 판매 통계 집계
    PERFORM aggregate_monthly_sales_statistics(target_year_month);
    
    -- 2. 패널별 판매 히스토리 집계
    PERFORM aggregate_panel_sales_history(target_year_month);
    
    -- 3. 고객 유형별 트렌드 분석
    PERFORM analyze_customer_type_trends(target_year_month);
    
    RAISE NOTICE '판매 분석 데이터 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 9. 유용한 뷰들 생성

-- 월별 판매 현황 요약 뷰
CREATE OR REPLACE VIEW monthly_sales_summary AS
SELECT 
    year_month,
    year,
    month,
    region_name,
    display_type_name,
    period_type,
    total_orders,
    total_slots_ordered,
    total_revenue,
    ROUND(availability_rate, 1) as availability_rate,
    active_panels,
    sold_out_panels,
    ROUND((individual_revenue::NUMERIC / NULLIF(total_revenue, 0)) * 100, 1) as individual_revenue_ratio,
    ROUND((corporate_revenue::NUMERIC / NULLIF(total_revenue, 0)) * 100, 1) as corporate_revenue_ratio,
    ROUND((public_institution_revenue::NUMERIC / NULLIF(total_revenue, 0)) * 100, 1) as public_institution_revenue_ratio
FROM monthly_sales_statistics mss
JOIN region_gu rgu ON rgu.id = mss.region_gu_id
JOIN display_types dt ON dt.id = mss.display_type_id
ORDER BY year DESC, month DESC, region_name, display_type_name, period_type;

-- 고객 유형별 트렌드 뷰
CREATE OR REPLACE VIEW customer_trends_summary AS
SELECT 
    year_month,
    customer_type,
    total_orders,
    total_slots,
    total_revenue,
    ROUND(average_order_value, 0) as average_order_value,
    ROUND(order_growth_rate, 1) as order_growth_rate,
    ROUND(revenue_growth_rate, 1) as revenue_growth_rate
FROM customer_type_trends
ORDER BY year_month DESC, customer_type;

-- 인기 패널 뷰
CREATE OR REPLACE VIEW popular_panels AS
SELECT 
    panel_name,
    region_name,
    year_month,
    period_type,
    total_orders,
    total_slots_sold,
    total_revenue,
    ROUND(total_revenue::NUMERIC / NULLIF(total_orders, 0), 0) as average_order_value
FROM panel_sales_history psh
JOIN panel_info pi ON pi.id = psh.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
ORDER BY total_revenue DESC, total_orders DESC;

-- 사용 예시:
-- SELECT * FROM generate_sales_analytics('2025년 8월');
-- SELECT * FROM monthly_sales_summary WHERE year_month = '2025년 8월';
-- SELECT * FROM customer_trends_summary WHERE year_month = '2025년 8월';
-- SELECT * FROM popular_panels WHERE year_month = '2025년 8월'; 