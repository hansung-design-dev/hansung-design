
CREATE TYPE price_unit_enum AS ENUM ('15 days', '1 year', '6 months', '3 years');
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
  panel_code INTEGER
  panel_type panel_type_enum_v2  --'manual', 'semi-auto', 'bulletin-boardg',  'lower-panel', 'multi-panel', 'led', 'no_lighting', 'with_lighting'
  -- 'bulletin-board', 'lower-panel','multi-panel','led','fabric'이 추가됨. 마포구의 경우를 대비. 다른 구의 경우도 게시대 일괄형식을 추가해봄.  
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
  base_price DECIMAL(10, 2) CHECK (base_price >= 0), -- 여기 이름이 total_price로 바뀜
  advertising_price INTEGER -- 광고비
  road_usage_fee INTEGER -- 도로사용비
  tax_price NUMERIC CHECK (tax_price >= 0),
  banner_type banner_type_enum_v2 NOT NULL, --'fabric','panel','bulletin-board','top_fixed'
  price_unit price_unit_enum DEFAULT '15 days, 6 months, 1 year, 3 years', -- 기한enum 추가
  is_premium BOOLEAN DEFAULT FALSE,
  panel_slot_status panel_slot_status_enum DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(panel_info_id, slot_number)
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
  total_price DECIMAL(10, 2) CHECK (base_price >= 0),
  tax_price NUMERIC CHECK (tax_price >= 0),
  advertising_price DECIMAL(10, 2) CHECK (advertising_price >= 0),-- 광고비
  road_usage_fee DECIMAL(10, 2) CHECK (road_usage_fee >= 0), -- 도로사용비
  administrative_fee DECIMAL(10, 2) CHECK (road_usage_fee >= 0),-- 구청수수료
  price_unit price_unit_enum DEFAULT '15 days',
  is_premium BOOLEAN DEFAULT FALSE,
  panel_slot_status panel_slot_status_enum DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
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

