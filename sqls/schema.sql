-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_auth (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_auth_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_order_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  is_paid boolean DEFAULT false,
  is_checked boolean DEFAULT false,
  is_received_order boolean DEFAULT false,
  is_received_payment boolean DEFAULT false,
  is_draft_sent boolean DEFAULT false,
  is_draft_received boolean DEFAULT false,
  is_address_verified boolean DEFAULT false,
  is_draft_verified boolean DEFAULT false,
  received_payment_at timestamp with time zone,
  admin_notes text,
  verified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_order_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT admin_order_verifications_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.admin_profiles(id),
  CONSTRAINT admin_order_verifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_auth_id uuid NOT NULL,
  name text NOT NULL,
  department text,
  position text,
  phone text,
  role text NOT NULL DEFAULT 'admin'::text CHECK (role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'designer'::text, 'sales'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT admin_profiles_admin_auth_id_fkey FOREIGN KEY (admin_auth_id) REFERENCES public.admin_auth(id)
);
CREATE TABLE public.bank_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid,
  display_type_id uuid,
  bank_name character varying,
  account_number character varying,
  depositor character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT bank_info_pkey PRIMARY KEY (id),
  CONSTRAINT bank_info_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT bank_info_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id)
);
CREATE TABLE public.banner_panel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL UNIQUE,
  is_for_admin boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_panel_details_pkey PRIMARY KEY (id),
  CONSTRAINT banner_panel_details_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE public.banner_slot_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  slot_number numeric NOT NULL,
  slot_name text,
  max_width numeric,
  max_height numeric,
  banner_type USER-DEFINED,
  price_unit USER-DEFINED DEFAULT '15 days'::price_unit_enum,
  panel_slot_status USER-DEFINED DEFAULT 'available'::panel_slot_status_enum,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_slot_info_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slot_info_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE public.banner_slot_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid,
  region_gu_display_period_id uuid,
  total_slots integer NOT NULL DEFAULT 0,
  available_slots integer NOT NULL DEFAULT 0,
  closed_slots integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_slot_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slot_inventory_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id),
  CONSTRAINT banner_slot_inventory_region_gu_display_period_id_fkey FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id)
);
CREATE TABLE public.banner_slot_price_policy (
  id uuid NOT NULL,
  banner_slot_info_id uuid NOT NULL,
  price_usage_type USER-DEFINED NOT NULL,
  tax_price integer NOT NULL DEFAULT 0,
  road_usage_fee integer NOT NULL DEFAULT 0,
  advertising_fee integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banner_slot_price_policy_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slot_price_policy_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_info_id) REFERENCES public.banner_slot_info(id)
);
CREATE TABLE public.customer_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_auth_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  product_name text,
  inquiry_status USER-DEFINED DEFAULT 'pending'::inquiry_status_enum,
  answer_content text,
  answer_admin_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  answered_at timestamp with time zone,
  closed_at timestamp with time zone,
  CONSTRAINT customer_inquiries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_service (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  answer text,
  answered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_service_pkey PRIMARY KEY (id),
  CONSTRAINT customer_service_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_auth(id)
);
CREATE TABLE public.design_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_profile_id uuid,
  admin_profile_id uuid,
  project_name text,
  file_name text,
  file_url text,
  file_extension text,
  file_size integer,
  draft_category text NOT NULL DEFAULT 'initial'::text CHECK (draft_category = ANY (ARRAY['initial'::text, 'feedback'::text, 'revision'::text, 'final'::text])),
  notes text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT design_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT design_drafts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT design_drafts_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT design_drafts_admin_profile_id_fkey FOREIGN KEY (admin_profile_id) REFERENCES public.admin_profiles(id)
);
CREATE TABLE public.display_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT display_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.homepage_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  homepage_menu_type uuid,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text,
  description_list ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  main_image_url text,
  CONSTRAINT homepage_contents_pkey PRIMARY KEY (id),
  CONSTRAINT homepage_contents_homepage_menu_type_fkey FOREIGN KEY (homepage_menu_type) REFERENCES public.homepage_menu_types(id)
);
CREATE TABLE public.homepage_menu_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL,
  description text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT homepage_menu_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.homepage_notice (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  priority USER-DEFINED DEFAULT 'normal'::notice_priority_enum,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT homepage_notice_pkey PRIMARY KEY (id)
);
CREATE TABLE public.led_panel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL UNIQUE,
  exposure_count integer CHECK (exposure_count >= 0),
  panel_width integer CHECK (panel_width > 0),
  panel_height integer CHECK (panel_height > 0),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  max_banners integer DEFAULT 20 CHECK (max_banners > 0),
  CONSTRAINT led_panel_details_pkey PRIMARY KEY (id),
  CONSTRAINT led_panel_details_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE public.led_slot_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  slot_name text,
  slot_width_px integer,
  slot_height_px integer,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  total_price numeric CHECK (total_price >= 0::numeric),
  tax_price numeric CHECK (tax_price >= 0::numeric),
  price_unit USER-DEFINED DEFAULT '15 days'::price_unit_enum,
  panel_slot_status USER-DEFINED DEFAULT 'available'::panel_slot_status_enum,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  advertising_fee numeric CHECK (advertising_fee >= 0::numeric),
  road_usage_fee numeric CHECK (road_usage_fee >= 0::numeric),
  administrative_fee numeric CHECK (administrative_fee >= 0::numeric),
  slot_number integer NOT NULL CHECK (slot_number >= 1 AND slot_number <= 30),
  first_half_closure_quantity integer DEFAULT 0,
  second_half_closure_quantity integer DEFAULT 0,
  CONSTRAINT led_slot_info_pkey PRIMARY KEY (id),
  CONSTRAINT led_slot_info_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE public.notice_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  sub_name character varying NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT notice_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  slot_order_quantity integer,
  display_start_date date,
  display_end_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  panel_info_id uuid,
  panel_slot_usage_id uuid,
  CONSTRAINT order_details_pkey PRIMARY KEY (id),
  CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_details_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id),
  CONSTRAINT order_details_panel_slot_usage_id_fkey FOREIGN KEY (panel_slot_usage_id) REFERENCES public.panel_slot_usage(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_slot_snapshot jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  auth_user_id uuid,
  user_profile_id uuid,
  user_auth_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  order_number character varying,
  payment_method_id uuid,
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'waiting_admin_approval'::text, 'approved'::text, 'completed'::text, 'cancelled'::text])),
  design_drafts_id uuid,
  draft_delivery_method text CHECK (draft_delivery_method = ANY (ARRAY['email'::text, 'upload'::text])),
  order_status text DEFAULT 'pending'::text CHECK (order_status = ANY (ARRAY['pending'::text, 'completed'::text])),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
  CONSTRAINT orders_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT orders_design_drafts_id_fkey FOREIGN KEY (design_drafts_id) REFERENCES public.design_drafts(id),
  CONSTRAINT orders_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_auth(id)
);
CREATE TABLE public.panel_guideline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_category_id uuid,
  notes text,
  order_period text,
  order_method text,
  account_info text,
  main_notice text,
  warning_notice text,
  show_warning boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  image_url ARRAY,
  region_gu_id uuid,
  guideline_type USER-DEFINED,
  CONSTRAINT panel_guideline_pkey PRIMARY KEY (id),
  CONSTRAINT panel_guideline_display_category_id_fkey FOREIGN KEY (display_category_id) REFERENCES public.display_types(id)
);
CREATE TABLE public.panel_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid,
  post_code text UNIQUE,
  region_gu_id uuid,
  region_dong_id uuid,
  nickname text NOT NULL,
  address text,
  photo_url text,
  location_url text,
  map_url text,
  latitude numeric,
  longitude numeric,
  panel_status USER-DEFINED DEFAULT 'active'::panel_status_enum,
  maintenance_notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  panel_code smallint CHECK (panel_code >= 1 AND panel_code <= 100),
  panel_type USER-DEFINED,
  max_banner integer DEFAULT 1,
  first_half_closure_quantity integer DEFAULT 0,
  second_half_closure_quantity integer DEFAULT 0,
  notes text,
  CONSTRAINT panel_info_pkey PRIMARY KEY (id),
  CONSTRAINT panel_info_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_info_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT panel_info_region_dong_id_fkey FOREIGN KEY (region_dong_id) REFERENCES public.region_dong(id)
);
CREATE TABLE public.panel_popup_notices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_category_id uuid,
  title text,
  hide_oneday boolean DEFAULT false,
  content json,
  image_url text,
  start_date date,
  end_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  region_gu_id uuid,
  notice_categories_id uuid,
  CONSTRAINT panel_popup_notices_pkey PRIMARY KEY (id),
  CONSTRAINT panel_popup_notices_display_category_id_fkey FOREIGN KEY (display_category_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_popup_notices_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.panel_slot_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid,
  panel_info_id uuid,
  slot_number integer,
  usage_type text,
  attach_date_from date,
  unit_price numeric CHECK (unit_price >= 0::numeric),
  is_active boolean DEFAULT true,
  is_closed boolean DEFAULT false,
  banner_type USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  banner_slot_info_id uuid,
  order_details_id uuid,
  CONSTRAINT panel_slot_usage_pkey PRIMARY KEY (id),
  CONSTRAINT panel_slot_usage_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_info_id) REFERENCES public.banner_slot_info(id),
  CONSTRAINT panel_slot_usage_order_details_id_fkey FOREIGN KEY (order_details_id) REFERENCES public.order_details(id),
  CONSTRAINT panel_slot_usage_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_slot_usage_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  method_type text NOT NULL,
  method_code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  description text,
  is_online boolean DEFAULT true,
  requires_admin_approval boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  payment_method_id uuid NOT NULL,
  payment_provider text,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text])),
  transaction_id text,
  payment_date timestamp with time zone,
  admin_approval_status text DEFAULT 'pending'::text CHECK (admin_approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_notes text,
  depositor_name text,
  deposit_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_require_tax_filing boolean,
  is_agreed_caution boolean,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);
CREATE TABLE public.region_dong (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  district_code text NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT region_dong_pkey PRIMARY KEY (id),
  CONSTRAINT region_dong_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.region_gu(code)
);
CREATE TABLE public.region_gu (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name character varying NOT NULL,
  logo_image_url text,
  bank_info text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  phone_number text,
  is_active boolean DEFAULT false,
  CONSTRAINT region_gu_pkey PRIMARY KEY (id)
);
CREATE TABLE public.region_gu_display_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid,
  region_gu_id uuid,
  period_from date,
  period_to date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  year_month character varying NOT NULL,
  period USER-DEFINED,
  CONSTRAINT region_gu_display_periods_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_display_periods_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT region_gu_display_periods_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id)
);
CREATE TABLE public.top_fixed_banner_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL,
  region_gu_display_period_id uuid NOT NULL,
  total_slots integer NOT NULL DEFAULT 1,
  available_slots integer NOT NULL DEFAULT 1,
  closed_faces integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  banner_slot_info_id uuid,
  CONSTRAINT top_fixed_banner_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT top_fixed_banner_inventory_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_info_id) REFERENCES public.banner_slot_info(id),
  CONSTRAINT top_fixed_banner_inventory_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id),
  CONSTRAINT top_fixed_banner_inventory_region_gu_display_period_id_fkey FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id)
);
CREATE TABLE public.user_auth (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  name character varying NOT NULL,
  phone character varying,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  terms_agreed boolean DEFAULT false,
  privacy_agreed boolean DEFAULT false,
  collection_agreed boolean DEFAULT false,
  third_party_agreed boolean DEFAULT false,
  agreed_at timestamp with time zone,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_auth_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_auth_id uuid,
  profile_title text NOT NULL,
  company_name text,
  business_registration_number text,
  phone text NOT NULL,
  email text NOT NULL,
  contact_person_name text NOT NULL,
  fax_number text,
  is_default boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  is_public_institution boolean DEFAULT false,
  is_company boolean DEFAULT false,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.user_auth(id)
);

---
---
--함수와 트리거 정리


-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- top_fixed_banner_inventory 업데이트 함수
CREATE OR REPLACE FUNCTION update_top_fixed_banner_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM banner_slot_info 
    WHERE id = NEW.banner_slot_info_id 
      AND slot_number = 0
      AND banner_type = 'top_fixed'
  ) THEN
    UPDATE top_fixed_banner_inventory 
    SET available_slots = 0,
        updated_at = NOW()
    WHERE panel_info_id = NEW.panel_info_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- order_details AFTER INSERT 시 snapshot 채우기
CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot_after_order_details()
RETURNS TRIGGER AS $$
DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
BEGIN
    IF NEW.panel_info_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT dt.name INTO v_panel_type
    FROM panel_info pi
    JOIN display_types dt ON pi.display_type_id = dt.id
    WHERE pi.id = NEW.panel_info_id;

    IF v_panel_type = 'banner_display' THEN
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            SELECT 
                bsi.*,
                bsp.total_price AS policy_total_price,
                bsp.tax_price AS policy_tax_price,
                bsp.road_usage_fee AS policy_road_usage_fee,
                bsp.advertising_fee AS policy_advertising_fee
            INTO v_slot_record
            FROM panel_slot_usage psu
            JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
            LEFT JOIN banner_slot_price_policy bsp 
              ON bsi.id = bsp.banner_slot_info_id 
             AND bsp.price_usage_type = 'default'
            WHERE psu.id = NEW.panel_slot_usage_id;
        ELSE
            SELECT 
                bsi.*,
                bsp.total_price AS policy_total_price,
                bsp.tax_price AS policy_tax_price,
                bsp.road_usage_fee AS policy_road_usage_fee,
                bsp.advertising_fee AS policy_advertising_fee
            INTO v_slot_record
            FROM banner_slot_info bsi
            LEFT JOIN banner_slot_price_policy bsp 
              ON bsi.id = bsp.banner_slot_info_id 
             AND bsp.price_usage_type = 'default'
            WHERE bsi.panel_info_id = NEW.panel_info_id
              AND bsi.slot_number = 1;
        END IF;
    ELSIF v_panel_type = 'led_display' THEN
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            SELECT lsi.* INTO v_slot_record 
            FROM panel_slot_usage psu
            JOIN led_slot_info lsi ON psu.panel_info_id = lsi.panel_info_id 
              AND psu.slot_number = lsi.slot_number
            WHERE psu.id = NEW.panel_slot_usage_id;
        ELSE
            SELECT * INTO v_slot_record 
            FROM led_slot_info
            WHERE panel_info_id = NEW.panel_info_id
              AND slot_number = 1;
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    IF v_slot_record.id IS NULL THEN
        RETURN NEW;
    END IF;

    v_snapshot := to_jsonb(v_slot_record);

    UPDATE orders 
    SET panel_slot_snapshot = v_snapshot
    WHERE id = NEW.order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-----
-- AFTER INSERT (order_details)
CREATE TRIGGER trigger_fill_panel_slot_snapshot_after_order_details
AFTER INSERT ON order_details
FOR EACH ROW EXECUTE FUNCTION fill_panel_slot_snapshot_after_order_details();

-- AFTER INSERT (panel_slot_usage)
CREATE TRIGGER trigger_update_top_fixed_banner_inventory
AFTER INSERT ON panel_slot_usage
FOR EACH ROW EXECUTE FUNCTION update_top_fixed_banner_inventory();

-- BEFORE UPDATE updated_at 자동 갱신 트리거들
CREATE TRIGGER update_banner_panel_details_updated_at
BEFORE UPDATE ON banner_panel_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_slot_info_updated_at
BEFORE UPDATE ON banner_slot_info
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_inquiries_updated_at
BEFORE UPDATE ON customer_inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_service_updated_at
BEFORE UPDATE ON customer_service
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_display_types_updated_at
BEFORE UPDATE ON display_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_contents_updated_at
BEFORE UPDATE ON homepage_contents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_menu_types_updated_at
BEFORE UPDATE ON homepage_menu_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_notice_updated_at
BEFORE UPDATE ON homepage_notice
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_led_panel_details_updated_at
BEFORE UPDATE ON led_panel_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_led_slot_info_updated_at
BEFORE UPDATE ON led_slot_info
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notice_categories_updated_at
BEFORE UPDATE ON notice_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_details_updated_at
BEFORE UPDATE ON order_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_guideline_updated_at
BEFORE UPDATE ON panel_guideline
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_info_updated_at
BEFORE UPDATE ON panel_info
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_popup_notices_updated_at
BEFORE UPDATE ON panel_popup_notices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_slot_usage_updated_at
BEFORE UPDATE ON panel_slot_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_dong_updated_at
BEFORE UPDATE ON region_dong
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_gu_display_periods_updated_at
BEFORE UPDATE ON region_gu_display_periods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_gu_guideline_updated_at
BEFORE UPDATE ON region_gu_guideline
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_gu_updated_at
BEFORE UPDATE ON region_gu
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_auth_updated_at
BEFORE UPDATE ON user_auth
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- 재고관리 트리거 함수들 (기존 트리거와 충돌하지 않도록 새로 생성)

-- 1. 일반 현수막게시대 재고 자동 감소 트리거 (banner_slot_inventory용)
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  panel_record RECORD;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
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
  
  -- 해당 기간의 재고 업데이트
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
  ELSE
    -- 기간을 찾지 못한 경우 로그 출력 (디버깅용)
    RAISE NOTICE '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 주문 취소 시 재고 자동 복구 트리거 (banner_slot_inventory용)
CREATE OR REPLACE FUNCTION restore_banner_slot_inventory_on_order_delete()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
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
  
  -- 해당 기간의 재고 복구
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
      closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
      updated_at = NOW()
    WHERE panel_info_id = OLD.panel_info_id
      AND region_gu_display_period_id = period_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. 중복 예약 방지 트리거 (panel_slot_usage용)
CREATE OR REPLACE FUNCTION prevent_duplicate_banner_booking()
RETURNS TRIGGER AS $$
DECLARE
  conflicting_usage RECORD;
BEGIN
  -- banner_type이 'top_fixed'가 아닌 경우에만 중복 확인 (일반 현수막게시대)
  IF NEW.banner_type != 'top_fixed' THEN
    -- 같은 패널의 같은 슬롯이 같은 기간에 이미 예약되어 있는지 확인
    SELECT ps.id INTO conflicting_usage
    FROM panel_slot_usage ps
    WHERE ps.panel_info_id = NEW.panel_info_id
      AND ps.slot_number = NEW.slot_number
      AND ps.is_active = true
      AND ps.is_closed = false
      AND ps.banner_type != 'top_fixed'
      AND (
        (ps.attach_date_from <= NEW.attach_date_from AND ps.attach_date_from + INTERVAL '15 days' >= NEW.attach_date_from)
        OR (ps.attach_date_from >= NEW.attach_date_from AND ps.attach_date_from <= NEW.attach_date_from + INTERVAL '15 days')
      );
    
    IF FOUND THEN
      RAISE EXCEPTION '선택한 기간에 이미 예약된 슬롯입니다. (conflicting_usage_id: %)', conflicting_usage.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 재고 부족 시 주문 방지 트리거
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  current_inventory RECORD;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
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
  
  -- 해당 기간의 재고 확인
  IF period_id IS NOT NULL THEN
    SELECT available_slots, total_slots INTO currfent_inventory
    FROM banner_slot_inventory
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
    IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
      RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개 (기간: %)', 
        NEW.slot_order_quantity, current_inventory.available_slots, period_id;
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 경고
    RAISE WARNING '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 등록 (기존 트리거와 충돌하지 않도록 새 이름 사용)
-- 1. order_details 삽입 시 재고 감소 (banner_slot_inventory)
DROP TRIGGER IF EXISTS banner_inventory_insert_trigger ON order_details;
CREATE TRIGGER banner_inventory_insert_trigger
  AFTER INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_slot_inventory_on_order();

-- 2. order_details 삭제 시 재고 복구 (banner_slot_inventory)
DROP TRIGGER IF EXISTS banner_inventory_delete_trigger ON order_details;
CREATE TRIGGER banner_inventory_delete_trigger
  AFTER DELETE ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION restore_banner_slot_inventory_on_order_delete();

-- 3. panel_slot_usage 삽입 시 중복 예약 방지
DROP TRIGGER IF EXISTS duplicate_banner_booking_trigger ON panel_slot_usage;
CREATE TRIGGER duplicate_banner_booking_trigger
  BEFORE INSERT ON panel_slot_usage
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_banner_booking();

-- 4. order_details 삽입 전 재고 부족 확인
DROP TRIGGER IF EXISTS inventory_check_trigger ON order_details;
CREATE TRIGGER inventory_check_trigger
  BEFORE INSERT ON order_details
  FOR EACH ROW
  EXECUTE FUNCTION check_inventory_before_order();

-- 5. 기간 생성 시 자동으로 재고 생성하는 트리거
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
        -- 해당 구의 모든 패널에 대해 재고 생성
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
            -- banner_slot_inventory 생성
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
                    WHEN NEW.half_period = 'first_half' THEN 
                        panel_record.total_slots - COALESCE(panel_record.first_half_closure_quantity, 0)
                    ELSE 
                        panel_record.total_slots - COALESCE(panel_record.second_half_closure_quantity, 0)
                END,
                CASE 
                    WHEN NEW.half_period = 'first_half' THEN 
                        COALESCE(panel_record.first_half_closure_quantity, 0)
                    ELSE 
                        COALESCE(panel_record.second_half_closure_quantity, 0)
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기간 생성 시 자동으로 재고 생성하는 트리거 등록
DROP TRIGGER IF EXISTS create_inventory_on_period_insert_trigger ON region_gu_display_periods;
CREATE TRIGGER create_inventory_on_period_insert_trigger
  AFTER INSERT ON region_gu_display_periods
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_on_period_insert();

-- 성능 최적화를 위한 인덱스 추가 (중복 방지)
CREATE INDEX IF NOT EXISTS idx_banner_slot_inventory_panel_info_id 
ON banner_slot_inventory(panel_info_id);

CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_panel_info_active 
ON panel_slot_usage(panel_info_id, is_active, is_closed, banner_type);

CREATE INDEX IF NOT EXISTS idx_order_details_panel_info_id 
ON order_details(panel_info_id);

-- 재고 현황 모니터링 뷰 생성
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
  pi.id as panel_info_id,
  pi.nickname as panel_name,
  pi.address,
  rgu.name as district,
  bsi.total_slots,
  bsi.available_slots,
  bsi.closed_slots,
  CASE 
    WHEN bsi.available_slots = 0 THEN '매진'
    WHEN bsi.available_slots <= bsi.total_slots * 0.2 THEN '재고부족'
    ELSE '재고있음'
  END as inventory_status,
  bsi.updated_at as last_updated
FROM panel_info pi
LEFT JOIN region_gu rgu ON pi.region_gu_id = rgu.id
LEFT JOIN banner_slot_inventory bsi ON pi.id = bsi.panel_info_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
ORDER BY bsi.updated_at DESC; 

--
-- 특정 연/월의 기간 데이터를 1회성으로 생성하는 함수
-- 사용 예시: SELECT generate_specific_month_periods(2025, 8);
CREATE OR REPLACE FUNCTION generate_specific_month_periods(target_year INTEGER, target_month INTEGER)
RETURNS void AS $$
DECLARE
    target_date DATE;
    target_year_month TEXT;
    display_type_record RECORD;
    region_record RECORD;
    period_record RECORD;
    panel_record RECORD;
BEGIN
    -- 대상 월 날짜 계산
    target_date := (target_year || '-' || target_month || '-01')::DATE;
    target_year_month := target_year || '년 ' || target_month || '월';
    
    RAISE NOTICE '대상 월 기간 생성 시작: %', target_year_month;
    
    -- 각 display_type에 대해
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name IN ('banner_display', 'led_display')
    LOOP
        -- 각 활성화된 구에 대해
        FOR region_record IN 
            SELECT id, name FROM region_gu 
            WHERE is_active = true
        LOOP
            -- 상반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'first_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'first_half'
            )
            RETURNING id INTO period_record;
            
            -- 하반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'second_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'second_half'
            );
            
            RAISE NOTICE '구 %에 % 타입 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '대상 월 기간 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 기간 생성 시 자동으로 재고도 자동으로 생성하는 함수
CREATE OR REPLACE FUNCTION generate_inventory_for_periods()
RETURNS void AS $$
DECLARE
    period_record RECORD;
    panel_record RECORD;
    banner_slot_record RECORD;
    top_fixed_record RECORD;
BEGIN
    -- 기간이 있지만 재고가 없는 경우들을 찾아서 재고 생성
    FOR period_record IN 
        SELECT 
            rgdp.id as period_id,
            rgdp.display_type_id,
            rgdp.region_gu_id,
            rgdp.year_month,
            rgdp.half_period,
            dt.name as display_type_name
        FROM region_gu_display_periods rgdp
        JOIN display_types dt ON rgdp.display_type_id = dt.id
        WHERE dt.name = 'banner_display'
    LOOP
        -- 해당 구의 모든 패널에 대해 재고 생성
        FOR panel_record IN 
            SELECT 
                pi.id as panel_info_id,
                pi.max_banner as total_slots,
                pi.first_half_closure_quantity,
                pi.second_half_closure_quantity
            FROM panel_info pi
            WHERE pi.region_gu_id = period_record.region_gu_id
              AND pi.display_type_id = period_record.display_type_id
              AND pi.panel_status = 'active'
        LOOP
            -- banner_slot_inventory 생성 (중복 방지)
            INSERT INTO banner_slot_inventory (
                panel_info_id,
                region_gu_display_period_id,
                total_slots,
                available_slots,
                closed_slots
            )
            SELECT 
                panel_record.panel_info_id,
                period_record.period_id,
                panel_record.total_slots,
                CASE 
                    WHEN period_record.half_period = 'first_half' THEN 
                        panel_record.total_slots - COALESCE(panel_record.first_half_closure_quantity, 0)
                    ELSE 
                        panel_record.total_slots - COALESCE(panel_record.second_half_closure_quantity, 0)
                END,
                CASE 
                    WHEN period_record.half_period = 'first_half' THEN 
                        COALESCE(panel_record.first_half_closure_quantity, 0)
                    ELSE 
                        COALESCE(panel_record.second_half_closure_quantity, 0)
                END
            WHERE NOT EXISTS (
                SELECT 1 FROM banner_slot_inventory 
                WHERE panel_info_id = panel_record.panel_info_id
                  AND region_gu_display_period_id = period_record.period_id
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
                SELECT 
                    panel_record.panel_info_id,
                    period_record.period_id,
                    top_fixed_record.banner_slot_info_id,
                    1, -- top_fixed는 보통 1개 슬롯
                    1, -- 초기에는 모두 사용 가능
                    0
                WHERE NOT EXISTS (
                    SELECT 1 FROM top_fixed_banner_inventory 
                    WHERE panel_info_id = panel_record.panel_info_id
                      AND region_gu_display_period_id = period_record.period_id
                      AND banner_slot_info_id = top_fixed_record.banner_slot_info_id
                );
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '재고 생성 완료';
END;
$$ LANGUAGE plpgsql;

-- 기간 생성 후 자동으로 재고도 생성하는 통합 함수
CREATE OR REPLACE FUNCTION generate_periods_with_inventory(target_year INTEGER, target_month INTEGER)
RETURNS void AS $$
BEGIN
    -- 1. 기간 생성
    PERFORM generate_specific_month_periods(target_year, target_month);
    
    -- 2. 재고 생성
    PERFORM generate_inventory_for_periods();
    
    RAISE NOTICE '%년 %월 기간 및 재고 생성 완료', target_year, target_month;
END;
$$ LANGUAGE plpgsql; 