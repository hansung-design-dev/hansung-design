-- 21 june 테이블 수정본 반영

--2. panel_info  닉네임 추가 (각 주소를 짧게 부르는 홈페이지의 '비고'란에 들어있는 내용 null있음.)


-- UUID Extension 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM 타입 정의
CREATE TYPE display_type_enum AS ENUM ('banner_display', 'led_display', 'public_design', 'digital_signage'); --상품타입
CREATE TYPE homepage_menu_enum AS ENUM ('landing', 'banner_display', 'led_display', 'public_design', 'digital_signage'); --홈페이지컨텐츠타입

CREATE TYPE banner_type_enum AS ENUM ('manual', 'semi-auto', 'panel','citizen-bulletin-board');--현수막타입
CREATE TYPE price_unit_enum AS ENUM ('15 days');
CREATE TYPE panel_status_enum AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'card', 'cash', 'etc');
CREATE TYPE cs_category_enum AS ENUM ('personal_cs', 'frequent_questions');
CREATE TYPE panel_slot_status_enum AS ENUM ('available', 'maintenance', 'unavailable');
CREATE TYPE order_status_enum AS ENUM ('draft_uploaded', 'submitted', 'awaiting_payment', 'paid', 'verified', 'completed');
CREATE TYPE notice_priority_enum AS ENUM ('important', 'normal');


-- 서울 구 테이블
CREATE TABLE region_gu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name VARCHAR(20) NOT NULL,
  logo_image TEXT,
  bank_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 서울 행정동 테이블
CREATE TABLE region_dong (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_code TEXT NOT NULL REFERENCES region_gu(code),
  name VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_code, name)
);

-- 디스플레이 타입
CREATE TABLE display_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name display_type_enum NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 홈페이지 콘텐츠 타입
CREATE TABLE homepage_menu_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name homepage_menu_enum NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 구별 디스플레이 기간
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
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(region_gu_id, display_type_id)
);

-- 게시대 기본 정보
CREATE TABLE panel_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_type_id UUID REFERENCES display_types(id),
  post_code TEXT UNIQUE NOT NULL,
  region_gu_id UUID REFERENCES region_gu(id),
  region_dong_id UUID REFERENCES region_dong(id),
  address TEXT NOT NULL,
  nickname TEXT, 
  photo_url TEXT,
  location_url TEXT,
  map_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  panel_status panel_status_enum DEFAULT 'active',
  maintenance_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 현수막 게시대 상세
CREATE TABLE banner_panel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID UNIQUE NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
  max_banners INTEGER DEFAULT 5 CHECK (max_banners > 0),
  panel_height DECIMAL(5, 2) CHECK (panel_height > 0),
  panel_width DECIMAL(5, 2) CHECK (panel_width > 0),
  is_for_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 현수막 면 정보
CREATE TABLE banner_slot_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 10),
  slot_name TEXT,
  max_width DECIMAL(5, 2),
  max_height DECIMAL(5, 2),
  base_price DECIMAL(10, 2) CHECK (base_price >= 0),
  --도로사용료
  --광고대행료
  tax_price NUMERIC CHECK (tax_price >= 0),
  banner_type banner_type_enum NOT NULL,
  price_unit price_unit_enum DEFAULT '15 days',
  is_premium BOOLEAN DEFAULT FALSE, -- 상단광고표기 하는 용도? 
  panel_slot_status panel_slot_status_enum DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(panel_info_id, slot_number)
);

-- LED 게시대 상세
CREATE TABLE led_panel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID UNIQUE NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
  exposure_count INTEGER CHECK (exposure_count >= 0),
  panel_width INTEGER CHECK (panel_width > 0),
  panel_height INTEGER CHECK (panel_height > 0),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- LED 면 정보
CREATE TABLE led_slot_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID NOT NULL REFERENCES panel_info(id) ON DELETE CASCADE,
  slot_name TEXT,
  slot_width_px INTEGER,
  slot_height_px INTEGER,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  base_price DECIMAL(10, 2) CHECK (base_price >= 0),
  tax_price NUMERIC CHECK (tax_price >= 0),
  price_unit price_unit_enum DEFAULT '15 days',
  is_premium BOOLEAN DEFAULT FALSE,
  panel_slot_status panel_slot_status_enum DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 면 사용 정보
CREATE TABLE panel_slot_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_type_id UUID REFERENCES display_types(id),
  panel_info_id UUID REFERENCES panel_info(id),
  slot_number INT,
  usage_type TEXT,
  attach_date_from DATE,
  unit_price NUMERIC CHECK (unit_price >= 0),
  tax_price NUMERIC CHECK (tax_price >= 0),
  total_price NUMERIC,
  is_active BOOLEAN DEFAULT TRUE,
  is_closed BOOLEAN DEFAULT FALSE,
  banner_type banner_type_enum NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(panel_info_id, slot_number, attach_date_from)
);

-- 주문 테이블
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_info_id UUID REFERENCES panel_info(id),
  panel_slot_usage_id UUID REFERENCES panel_slot_usage(id),
  panel_slot_snapshot JSONB,
  total_price NUMERIC CHECK (total_price >= 0),
  depositor_name TEXT,
  deposit_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  is_checked BOOLEAN DEFAULT FALSE,
  invoice_issued_at DATE,
  invoice_file TEXT,
  payment_method TEXT,
  is_received_order BOOLEAN DEFAULT FALSE,
  is_received_paymenet BOOLEAN DEFAULT FALSE,
  is_draft_sent BOOLEAN DEFAULT FALSE,
  is_draft_received BOOLEAN DEFAULT FALSE,
  is_address_verified BOOLEAN DEFAULT FALSE,
  is_draft_verified BOOLEAN,
  display_location TEXT,
  received_payment_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 주문 상세 테이블
CREATE TABLE order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  slot_order_quantity INT,
  display_start_date DATE,
  display_end_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CHECK (display_start_date <= display_end_date)
);

-- 트리거 함수
CREATE FUNCTION fill_panel_slot_snapshot() RETURNS TRIGGER AS $$
DECLARE
  panel_type TEXT;
  slot_record RECORD;
BEGIN
  SELECT dt.name INTO panel_type
  FROM panel_info pi
  JOIN display_types dt ON pi.display_type_id = dt.id
  WHERE pi.id = NEW.panel_info_id;

  IF panel_type = 'banner_display' THEN
    SELECT * INTO slot_record FROM banner_slot_info
    WHERE panel_info_id = NEW.panel_info_id
      AND slot_number = (SELECT slot_number FROM panel_slot_usage WHERE id = NEW.panel_slot_usage_id);
  ELSIF panel_type = 'led_display' THEN
    SELECT * INTO slot_record FROM led_slot_info
    WHERE panel_info_id = NEW.panel_info_id
    LIMIT 1;
  END IF;

  NEW.panel_slot_snapshot := to_jsonb(slot_record);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fill_slot_snapshot
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION fill_panel_slot_snapshot();

-- 홈페이지 콘텐츠
CREATE TABLE homepage_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homepage_menu_type UUID REFERENCES homepage_menu_types(id),
  region_gu_id UUID REFERENCES region_gu(id),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  description_list TEXT[],
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 공지사항
CREATE TABLE homepage_notice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority notice_priority_enum DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 지역별 유동인구/추가정보
CREATE TABLE homepage_contents_region (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_gu_id UUID REFERENCES region_gu(id),
  panel_info_id UUID REFERENCES panel_info(id),
  traffic_info TEXT,
  memo TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 제품별 팝업 공지
CREATE TABLE panel_popup_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_category_id UUID REFERENCES display_types(id),
  title TEXT,
  hide_oneday BOOLEAN DEFAULT FALSE,
  content TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 제품별 가이드라인
CREATE TABLE panel_guideline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_category_id UUID REFERENCES display_types(id),
  notes TEXT,
  order_period TEXT,
  order_method TEXT,
  account_info TEXT,
  guide_file_url TEXT,
  main_notice TEXT,
  warning_notice TEXT,
  show_warning BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
