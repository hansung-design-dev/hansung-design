
-- UUID extension 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM 타입 정의
CREATE TYPE display_type_enum AS ENUM ('banner_display', 'led_display', 'public_design', 'digital_signage');
CREATE TYPE homepage_menu_enum AS ENUM ('landing', 'banner_display', 'led_display', 'public_design', 'digital_signage');
CREATE TYPE banner_type_enum AS ENUM ('horizontal', 'vertical', 'custom');
CREATE TYPE price_unit_enum AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE panel_status_enum AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'card', 'cash', 'etc');
CREATE TYPE cs_category_enum AS ENUM ('personal_cs', 'frequent_questions');
CREATE TYPE panel_slot_status_enum AS ENUM ('available', 'maintenance', 'unavailable');
CREATE TYPE order_status_enum AS ENUM ('draft_uploaded', 'submitted', 'awaiting_payment', 'paid', 'verified', 'completed');

-- 1. 서울 구 테이블 (미리 데이터 입력)
CREATE TABLE region_gu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name VARCHAR(20) NOT NULL,
    logo_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 서울 행정동 테이블
CREATE TABLE region_dong (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code TEXT NOT NULL REFERENCES region_gu(code),
    name VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(district_code, name)
);

-- 3. 디스플레이 타입 테이블 (프로덕트 분류)
CREATE TABLE display_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name display_type_enum NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);
CREATE TYPE display_type_enum AS ENUM ('banner_display', 'led_display', 'public_design', 'digital_signage');

-- 4. 홈페이지 컨텐츠 타입 테이블 (콘텐츠 분류)
CREATE TABLE homepage_content_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name homepage_menu_enum NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);
CREATE TYPE homepage_menu_enum AS ENUM ('landing', 'banner_display', 'led_display', 'public_design', 'digital_signage');

-- 5. 게시대 기본 정보 테이블 (현수막/led 공통 메타 정보, 이 둘은 웹사이트 주문 가능함)
CREATE TABLE panel_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_type_id UUID REFERENCES display_types(id), --게시대 정보
    post_code TEXT UNIQUE NOT NULL, -- 우편번호
    region_gu_id UUID REFERENCES region_gu(id),
    region_dong_id UUID REFERENCES region_dong(id),
    address TEXT NOT NULL, --게시대 주소
    photo_url TEXT, -- 게시대 실물사진
    location_url TEXT, -- 게시대 위치 위성지도
    map_url TEXT, -- 게시대 위치 지도
    latitude DECIMAL(10, 8), --위도
    longitude DECIMAL(11, 8), --경도
    panel_status panel_status_enum DEFAULT 'active', --게시대 사용가능여부
    maintenance_notes TEXT, -- 유지보수 유의사항
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    CONSTRAINT chk_panel_status CHECK (panel_status IN ('active', 'maintenance', 'inactive')),
    CONSTRAINT chk_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    )
);
CREATE TYPE panel_status_enum AS ENUM ('active', 'maintenance', 'inactive');

-- 6. 현수막 게시대 상세 정보 테이블 (현수막 게시대에만 있는 정보)
CREATE TABLE banner_panel_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID UNIQUE NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
    max_banners INTEGER DEFAULT 5, -- 게시대에 달 수 있는 최대 면 수
	  panel_height DECIMAL(5, 2), --게시대 높이
    panel_width DECIMAL(5, 2), -- 게시대 너비
    is_for_admin BOOLEAN DEFAULT FALSE, -- 행정용게시대인지 구분
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    CONSTRAINT chk_banner_dimensions CHECK (post_height > 0 AND post_width > 0),
    CONSTRAINT chk_banner_max_banners CHECK (max_banners > 0)
);

-- 7. LED 게시대 상세 정보 테이블(LED 게시대에만 있는 정보)
CREATE TABLE led_panel_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID UNIQUE NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
    exposure_count INTEGER, -- 노출수량
    panel_width INTEGER,  -- px
	  panel_height INTEGER, -- px
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    CONSTRAINT chk_led_dimensions CHECK (screen_width > 0 AND screen_height > 0),
    CONSTRAINT chk_led_exposure_count CHECK (exposure_count >= 0),
    CONSTRAINT chk_led_brightness CHECK (brightness > 0)
);

-- 8. 현수막 게시대 슬롯 정보 테이블 (게시대 한 면의 정보)
CREATE TABLE banner_slot_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 5),
    slot_name TEXT,
    max_width DECIMAL(5, 2),
    max_height DECIMAL(5, 2),
    base_price DECIMAL(10, 2),
    tax_price NUMERIC,
    banner_type banner_type_enum NOT NULL,
    price_unit price_unit_enum DEFAULT 'daily',
    is_premium BOOLEAN DEFAULT FALSE,
    panel_slot_status panel_slot_status_enum DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(panel_info_id, slot_number)
);
CREATE TYPE banner_type_enum AS ENUM ('horizontal', 'vertical', 'custom');
CREATE TYPE price_unit_enum AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE panel_slot_status_enum AS ENUM ('available', 'maintenance', 'unavailable');

-- 9. LED 게시대 면 정보 테이블
CREATE TABLE led_slot_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
    slot_name TEXT,
    slot_width_px INTEGER,
    slot_height_px INTEGER,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    base_price DECIMAL(10, 2), --기본료
    tax_price NUMERIC, -- 텍스
    price_unit price_unit_enum DEFAULT 'daily',
    is_premium BOOLEAN DEFAULT FALSE, -- 프리미엄 자리 여부 (눈에 잘 띄는 위치)
    panel_slot_status panel_slot_status_enum DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 10. 게시대 면 사용 정보(기한,가격) 테이블 (order 테이블 trigger)
CREATE TABLE panel_slot_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_type_id UUID REFERENCES display_types(id) ON DELETE CASCADE,
    panel_info_id UUID REFERENCES panel_info(id),
    slot_number INT, -- 분류 : 소형게시대, 등.. 확인 필요
    usage_type TEXT,
    attach_date_from DATE,
    unit_price NUMERIC,
    tax_price NUMERIC,
    total_price NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    is_closed BOOLEAN DEFAULT FALSE,
    banner_type banner_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 11. 주문 테이블
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    order_name TEXT,
    user_id UUID, -- REFERENCES users(id) - users 테이블이 없어서 주석 처리
    company_id UUID, -- REFERENCES companies(id) - companies 테이블이 없어서 주석 처리
    panel_info_id UUID REFERENCES panel_info(id), --게시대 정보
    panel_slot_info_id JSONB, -- 게시대 면 정보 {...}
    panel_slot_usage_id UUID REFERENCES panel_slot_usage(id), -- 게시대 면 사용정보
    total_price NUMERIC,
    depositor_name TEXT,
    deposit_date DATE,
    is_paid BOOLEAN DEFAULT FALSE,
    is_checked BOOLEAN DEFAULT FALSE,
    invoice_issued_at DATE,
    invoice_file TEXT,
    payment_method TEXT,
    email TEXT,
    is_draft_uploaded BOOLEAN,
    received_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_image_verified BOOLEAN,
    is_received BOOLEAN,
    is_all_checked BOOLEAN,
    is_selected BOOLEAN DEFAULT FALSE,
    display_location TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 12. 주문 세부사항 테이블
CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    slot_order_quantity INT,
    display_start_date DATE,
    display_end_date DATE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 13. 구별 디스플레이 기간 테이블
CREATE TABLE region_gu_display_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_type_id UUID REFERENCES display_types(id),
    region_gu_id UUID REFERENCES region_gu(id),
    first_half_from DATE,
    first_half_to DATE,
    first_half_closure_quantity INT DEFAULT 0,
    second_half_from DATE,
    second_half_to DATE,
    second_half_closure_quantity INT DEFAULT 0,
    next_first_half_from DATE,
    next_first_half_to DATE,
    next_first_half_closure_quantity INT DEFAULT 0,
    next_second_half_from DATE,
    next_second_half_to DATE,
    next_second_half_closure_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 8. Users
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
name TEXT NOT NULL,
phone TEXT,
birthdate DATE,
is_business BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now()
);

-- 9. Company Info --
CREATE TABLE companies (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
company_name TEXT,
business_number TEXT,
representative TEXT,
address TEXT,
phone TEXT,
fax TEXT,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now()
);

-- 10. User-Company 연결 테이블
CREATE TABLE user_companies (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
role TEXT DEFAULT 'member', -- 'owner', 'admin', 'manager', 'member' 등
is_primary BOOLEAN DEFAULT FALSE, -- 주 소속 회사 여부
joined_at TIMESTAMP DEFAULT now(),
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
    
-- 한 사용자가 같은 회사에 중복으로 소속될 수 없도록 제약
UNIQUE(user_id, company_id)
)
