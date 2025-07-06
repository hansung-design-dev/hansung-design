CREATE TYPE panel_type_enum_v2 AS ENUM ( -- 게시대 타입: 게시대 형태,설치방법, 디스플레이 형태에 따른 분류
-- > 수동설치타입, 반자동, 시민게시대, 저단형, 연립형, 전자게시대, 조명, 비조명, 패널형
  'manual',
  'semi-auto',
  'bulletin-boardg',
  'lower-panel',
  'multi-panel',
  'led',
  'no_lighting',
  'with_lighting',
  'panel'
);


-- banner_type_enum_v2
CREATE TYPE banner_type_enum_v2 AS ENUM ( --  현수막 재질이나 위치 분류 -> 천, 패널(비닐재질), 시민/문화게시대 , 상단고정
  'fabric',
  'panel',
  'bulletin-board',
  'top_fixed'
);

CREATE TYPE price_unit_enum AS ENUM ('15 days', '1 year', '6 months', '3 years');
CREATE TYPE panel_status_enum AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'card', 'cash', 'etc');
CREATE TYPE cs_category_enum AS ENUM ('personal_cs', 'frequent_questions');
CREATE TYPE panel_slot_status_enum AS ENUM ('available', 'maintenance', 'unavailable');
CREATE TYPE order_status_enum AS ENUM ('draft_uploaded', 'submitted', 'awaiting_payment', 'paid', 'verified', 'completed');
CREATE TYPE notice_priority_enum AS ENUM ('important', 'normal');
CREATE TYPE guideline_category_enum AS ENUM (
  'default',        -- 기본 가이드라인 (모든 구에 적용)
  'admin',          -- 행정용 (서대문구 전용)
  'top_fixed',    -- 상단광고 (마포구 전용)
  'led' -- led 가이드라인
);

CREATE TYPE panel_status_enum AS ENUM ('active', 'maintenance', 'inactive');



CREATE TABLE region_gu (
  id uuid PRIMARY KEY,
  code text,
  name varchar,
  logo_image_url text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE bank_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region_gu_id uuid REFERENCES region_gu(id),
    display_type_id uuid REFERENCES display_types(id),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    depositor VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE region_dong (
  id uuid PRIMARY KEY,
  district_code text,
  name varchar,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE panel_info --게시판 메타 정보
(
  id uuid PRIMARY KEY,
  display_type_id uuid REFERENCES display_types(id),
  region_gu_id uuid REFERENCES region_gu(id),
  region_dong_id uuid REFERENCES region_dong(id),
  post_code text,
  nickname text,
  address text,
  photo_url text,
  location_url text,
  map_url text,
  latitude numeric,
  longitude numeric,
  panel_status panel_status_enum,
  maintenance_notes text,
  created_at timestamp,
  updated_at timestamp,
  panel_code smallint,
  panel_type panel_type_enum_v2
);

CREATE TYPE panel_type_enum_v2 AS ENUM (
  'manual',
  'semi-auto',
  'bulletin-boardg',
  'lower-panel',
  'multi-panel',
  'led',
  'no_lighting',
  'with_lighting',
  'panel'
);

CREATE TABLE panel_guideline -- 게시판 기간 안내
(
  id uuid PRIMARY KEY,
  display_category_id uuid REFERENCES display_types(id),
  notes text,
  order_period text,
  order_method text,
  account_info text,
  guide_file_url text,
  main_notice text,
  warning_notice text,
  show_warning boolean,
  created_at timestamp,
  updated_at timestamp
);



CREATE TYPE banner_type_enum AS ENUM (
  'fabric',
  'panel',
  'bulletin-board',
  'top_fixed'
);

CREATE TABLE panel_slot_usage (
  id uuid PRIMARY KEY,
  display_type_id uuid REFERENCES display_types(id),
  panel_info_id uuid REFERENCES panel_info(id),
  slot_number integer,
  usage_type text,
  attach_date_from date,
  unit_price numeric,
  tax_price numeric,
  total_price numeric,
  is_active boolean,
  is_closed boolean,
  banner_type banner_type_enum,
  created_at timestamp,
  updated_at timestamp
);

CREATE TYPE banner_type_enum_v2 AS ENUM (
  'fabric',
  'panel',
  'bulletin-board',
  'top_fixed'
);

CREATE TYPE price_unit_enum AS ENUM (
  '15 days', '1 year', '6 months', '3 years'
);

CREATE TYPE panel_slot_status_enum AS ENUM (
  'available', 'maintenance', 'unavailable'
);

CREATE TABLE banner_slot_info (
  id uuid PRIMARY KEY,
  panel_info_id uuid REFERENCES panel_info(id),
  slot_number integer,
  slot_name text,
  max_width numeric,
  max_height numeric,
  total_price numeric,
  tax_price numeric,
  banner_type banner_type_enum_v2,
  price_unit price_unit_enum,
  is_premium boolean,
  panel_slot_status panel_slot_status_enum,
  notes text,
  created_at timestamp,
  updated_at timestamp,
  road_usage_fee numeric,
  advertising_fee numeric
);

CREATE TABLE banner_panel_details (
  id uuid PRIMARY KEY,
  panel_info_id uuid REFERENCES panel_info(id),
  max_banners integer,
  panel_height numeric,
  panel_width numeric,
  is_for_admin boolean,
  created_at timestamp,
  updated_at timestamp
);

CREATE TYPE payment_method_enum AS ENUM (
  'bank_transfer', 'card', 'cash', 'etc'
);

CREATE TABLE orders (
  id uuid PRIMARY KEY,
  panel_info_id uuid REFERENCES panel_info(id),
  panel_slot_usage_id uuid REFERENCES panel_slot_usage(id),
  panel_slot_snapshot jsonb,
  total_price numeric,
  depositor_name text,
  deposit_date date,
  is_paid boolean,
  is_checked boolean,
  invoice_issued_at date,
  invoice_file text,
  payment_method payment_method_enum,
  is_received_order boolean,
  is_received_paymenet boolean,
  is_draft_sent boolean,
  is_draft_received boolean,
  is_address_verified boolean,
  is_draft_verified boolean,
  display_location text,
  received_payment_at timestamp,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE order_details (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  slot_order_quantity integer,
  display_start_date date,
  display_end_date date,
  created_at timestamp,
  updated_at timestamp
);


CREATE TABLE led_panel_details (
  id uuid PRIMARY KEY,
  panel_info_id uuid REFERENCES panel_info(id),
  exposure_count integer,
  panel_width integer,
  panel_height integer,
  created_at timestamp,
  updated_at timestamp,
  max_banners integer
);

CREATE TABLE led_slot_info (
  id uuid PRIMARY KEY,
  panel_info_id uuid REFERENCES panel_info(id),
  slot_name text,
  slot_width_px integer,
  slot_height_px integer,
  position_x integer,
  position_y integer,
  total_price numeric,
  tax_price numeric,
  price_unit price_unit_enum,
  is_premium boolean,
  panel_slot_status panel_slot_status_enum,
  notes text,
  created_at timestamp,
  updated_at timestamp,
  advertising_fee numeric,
  road_usage_fee numeric,
  administrative_fee numeric,
  slot_number integer
);


CREATE TABLE panel_popup_notices -- 게시판 팝업 안내, 구별, 게시판 종류별 
(
  id uuid PRIMARY KEY,
  display_category_id uuid REFERENCES display_types(id),
  notice_categories_id uuid REFERENCES notice_categories(id), 
  region_gu_id uuid REFERENCES region_gu(id),
  title text,
  hide_oneday boolean,
  content json,
  image_url text,
  start_date date,
  end_date date,
  created_at timestamp,
  updated_at timestamp 
);



CREATE TABLE homepage_contents --랜딩페이지 섹션별 컨텐트
 (
  id uuid PRIMARY KEY,
  homepage_menu_type uuid REFERENCES homepage_menu_types(id),
  region_gu_id uuid REFERENCES region_gu(id),
  title text,
  subtitle text,
  description text,
  description_list text[],
  image_url text,
  created_at timestamp,
  updated_at timestamp
);


CREATE TABLE notice_categories  -- 구별 안내사항 종류 - 기본안내, 주의안내 ....
(
  id uuid PRIMARY KEY,
  name varchar,
  sub_name varchar,
  display_order integer,
  is_active boolean,
  created_at timestamp,
  updated_at timestamp
);


CREATE TYPE notice_priority_enum AS ENUM (
  'important', 'normal'
);

CREATE TABLE homepage_notice  -- 공지사항리스트 (디자인 안나옴)
(
  id uuid PRIMARY KEY,
  title text,
  content text,
  is_active boolean,
  priority notice_priority_enum,
  created_at timestamp,
  updated_at timestamp
);


CREATE TYPE homepage_menu_enum AS ENUM (
  'landing',
  'banner_display',
  'led_display',
  'public_design',
  'digital_signage'
);

CREATE TABLE homepage_menu_types (
  id uuid PRIMARY KEY,
  name homepage_menu_enum,
  description text,
  created_at timestamp
);

CREATE TYPE display_type_enum AS ENUM (
  'banner_display',
  'led_display',
  'public_design',
  'digital_signage'
);

CREATE TABLE display_types (
  id uuid PRIMARY KEY,
  name display_type_enum,
  description text,
  created_at timestamp
);

CREATE TABLE region_gu_display_periods -- 구별 게시기간 정보
(
  id uuid PRIMARY KEY,
  display_type_id uuid REFERENCES display_types(id),
  region_gu_id uuid REFERENCES region_gu(id),
  first_half_from date,
  first_half_to date,
  first_half_closure_quantity integer,
  second_half_from date,
  second_half_to date,
  second_half_closure_quantity integer,
  next_first_half_from date,
  next_first_half_to date,
  next_first_half_closure_quantity integer,
  next_second_half_from date,
  next_second_half_to date,
  next_second_half_closure_quantity integer,
  created_at timestamp,
  updated_at timestamp
);

CREATE TYPE guideline_category_enum AS ENUM (
  'default',        -- 기본 가이드라인 (모든 구에 적용)
  'admin',          -- 행정용 (서대문구 전용)
  'top_fixed',    -- 상단광고 (마포구 전용)
  'led' -- led 가이드라인
);

CREATE TABLE region_gu_guideline (
  id uuid PRIMARY KEY,
  region_gu_id uuid REFERENCES region_gu(id),
  display_type display_type_enum NOT NULL,   -- 현수막 or LED
  category guideline_category_enum DEFAULT 'default', -- 추가 구분 (선택적)
  title text,
  description text,
  image_urls text[],
  content_json jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 1:1 상담문의 상태 enum
CREATE TYPE inquiry_status_enum AS ENUM (
  'pending',      -- 문의 접수 (답변 대기)
  'answered',     -- 답변 완료
  'closed'        -- 문의 종료
);

-- 1:1 상담문의 테이블
CREATE TABLE customer_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id uuid NOT NULL,                    -- 문의자 (auth_users.id)
  title text NOT NULL,                           -- 문의 제목
  content text NOT NULL,                         -- 문의 내용
  product_name text,                             -- 관련 상품명 (선택사항)
  inquiry_status inquiry_status_enum DEFAULT 'pending', -- 문의 상태
  answer_content text,                           -- 답변 내용
  answer_admin_id uuid,                          -- 답변자 ID (관리자)
  created_at timestamptz DEFAULT now(),          -- 문의 작성 시간
  updated_at timestamptz DEFAULT now(),          -- 문의 수정 시간
  answered_at timestamptz,                       -- 답변 작성 시간
  closed_at timestamptz                          -- 문의 종료 시간
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_customer_inquiries_user_auth_id ON customer_inquiries(user_auth_id);
CREATE INDEX idx_customer_inquiries_status ON customer_inquiries(inquiry_status);
CREATE INDEX idx_customer_inquiries_created_at ON customer_inquiries(created_at);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- customer_inquiries 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_customer_inquiries_updated_at 
    BEFORE UPDATE ON customer_inquiries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();