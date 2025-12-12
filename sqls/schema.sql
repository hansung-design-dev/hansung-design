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
  CONSTRAINT admin_order_verifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT admin_order_verifications_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.admin_profiles(id)
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
CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid,
  display_type_id uuid,
  bank_name character varying,
  account_number character varying,
  depositor character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  contact text,
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT bank_accounts_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT bank_accounts_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.banner_display_cache (
  id integer NOT NULL DEFAULT nextval('banner_display_cache_id_seq'::regclass),
  region_id uuid NOT NULL UNIQUE,
  region_name character varying NOT NULL,
  region_code character varying NOT NULL,
  logo_image_url text,
  phone_number character varying,
  panel_count integer DEFAULT 0,
  price_summary text,
  period_summary text,
  bank_name character varying,
  account_number character varying,
  depositor character varying,
  display_order integer DEFAULT 999,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT banner_display_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.banner_panel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL UNIQUE,
  is_for_admin boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_panel_details_pkey PRIMARY KEY (id),
  CONSTRAINT banner_panel_details_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id)
);
CREATE TABLE public.banner_slot_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  banner_slot_id uuid NOT NULL,
  region_gu_display_period_id uuid NOT NULL,
  is_available boolean DEFAULT true,
  is_closed boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_slot_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slot_inventory_banner_slot_id_fkey FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id),
  CONSTRAINT banner_slot_inventory_region_gu_display_period_id_fkey FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id)
);
CREATE TABLE public.banner_slot_price_policy (
  id uuid NOT NULL,
  banner_slot_id uuid NOT NULL,
  price_usage_type USER-DEFINED NOT NULL,
  tax_price integer NOT NULL DEFAULT 0,
  road_usage_fee integer NOT NULL DEFAULT 0,
  advertising_fee integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banner_slot_price_policy_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slot_price_policy_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id),
  CONSTRAINT banner_slot_price_policy_banner_slot_id_fkey FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id)
);
CREATE TABLE public.banner_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL,
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
  CONSTRAINT banner_slots_pkey PRIMARY KEY (id),
  CONSTRAINT banner_slots_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id)
);
CREATE TABLE public.center_ad_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL,
  is_occupied boolean NOT NULL DEFAULT false,
  occupied_slot_id uuid,
  occupied_until date,
  occupied_from date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT center_ad_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT center_ad_inventory_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id),
  CONSTRAINT center_ad_inventory_occupied_slot_id_fkey FOREIGN KEY (occupied_slot_id) REFERENCES public.banner_slots(id)
);
CREATE TYPE customer_inquiry_product_type_enum AS ENUM ('led', 'top_fixed', 'digital_media_product');
CREATE TYPE draft_category_enum AS ENUM ('initial', 'feedback', 'revision', 'final');

CREATE TABLE public.customer_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_auth_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  product_name text,
  product_type customer_inquiry_product_type_enum DEFAULT 'digital_media_product',
  led_slot_id uuid,
  top_fixed_id uuid,
  digital_product_id uuid,
  inquiry_status USER-DEFINED DEFAULT 'pending'::inquiry_status_enum,
  answer_content text,
  answer_admin_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  answered_at timestamp with time zone,
  closed_at timestamp with time zone,
  CONSTRAINT customer_inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT customer_inquiries_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.user_auth(id),
  CONSTRAINT customer_inquiries_led_slot_id_fkey FOREIGN KEY (led_slot_id) REFERENCES public.led_slots(id),
  CONSTRAINT customer_inquiries_top_fixed_id_fkey FOREIGN KEY (top_fixed_id) REFERENCES public.top_fixed_banner_inventory(id),
  CONSTRAINT customer_inquiries_digital_product_id_fkey FOREIGN KEY (digital_product_id) REFERENCES public.digital_products(id)
);
CREATE TABLE public.design_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid,
  admin_profile_id uuid,
  file_name text,
  file_url text,
  file_extension text,
  file_size integer,
  draft_category draft_category_enum NOT NULL DEFAULT 'initial'::draft_category_enum,
  notes text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  project_name text,
  CONSTRAINT design_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT design_drafts_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT design_drafts_admin_profile_id_fkey FOREIGN KEY (admin_profile_id) REFERENCES public.admin_profiles(id)
);
CREATE TABLE public.display_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT display_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.frequent_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  answer text,
  answered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  homepage_menu_type uuid,
  cs_categories USER-DEFINED,
  CONSTRAINT frequent_questions_pkey PRIMARY KEY (id),
  CONSTRAINT customer_service_homepage_menu_type_fkey FOREIGN KEY (homepage_menu_type) REFERENCES public.homepage_menu_types(id)
);
CREATE TABLE public.homepage_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  homepage_menu_types uuid,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text,
  description_list ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  main_image_url text,
  page USER-DEFINED,
  CONSTRAINT homepage_contents_pkey PRIMARY KEY (id),
  CONSTRAINT homepage_contents_homepage_menu_types_fkey FOREIGN KEY (homepage_menu_types) REFERENCES public.homepage_menu_types(id)
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
CREATE TABLE public.installed_banner (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  folder_path text NOT NULL DEFAULT ''::text,
  region_gu_id uuid,
  display_order integer NOT NULL,
  CONSTRAINT installed_banner_pkey PRIMARY KEY (id),
  CONSTRAINT installed_banner_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.led_display_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid NOT NULL UNIQUE,
  district_logo_url text,
  district_image_url text,
  region_name text,
  region_code character varying,
  logo_image_url text,
  phone_number character varying,
  panel_count integer DEFAULT 0,
  price_summary text,
  period_summary text,
  bank_name character varying,
  account_number character varying,
  depositor character varying,
  display_order integer DEFAULT 999,
  last_updated timestamp with time zone DEFAULT now(),
  panel_status character varying DEFAULT 'active'::character varying,
  CONSTRAINT led_display_cache_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_cache_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.led_display_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL,
  region_gu_display_period_id uuid NOT NULL,
  total_faces integer NOT NULL DEFAULT 20,
  available_faces integer NOT NULL DEFAULT 20,
  closed_faces integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT led_display_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_inventory_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id),
  CONSTRAINT led_display_inventory_region_gu_display_period_id_fkey FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id)
);
CREATE TABLE public.led_display_price_policy (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL UNIQUE,
  price_usage_type USER-DEFINED DEFAULT 'default'::price_usage_type,
  tax_price integer NOT NULL DEFAULT 0,
  road_usage_fee integer NOT NULL DEFAULT 0,
  advertising_fee integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  vat_amount integer DEFAULT 0,
  vat_price integer DEFAULT 0,
  CONSTRAINT led_display_price_policy_pkey PRIMARY KEY (id),
  CONSTRAINT led_display_price_policy_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id)
);
CREATE TABLE public.led_panel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL UNIQUE,
  exposure_count integer CHECK (exposure_count >= 0),
  panel_width integer CHECK (panel_width > 0),
  panel_height integer CHECK (panel_height > 0),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  max_banners integer DEFAULT 20 CHECK (max_banners > 0),
  CONSTRAINT led_panel_details_pkey PRIMARY KEY (id),
  CONSTRAINT led_panel_details_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id)
);
CREATE TABLE public.led_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL,
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
  CONSTRAINT led_slots_pkey PRIMARY KEY (id),
  CONSTRAINT led_slots_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id)
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
  panel_id uuid,
  panel_slot_usage_id uuid,
  CONSTRAINT order_details_pkey PRIMARY KEY (id),
  CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_details_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id),
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
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'pending_deposit'::text, 'waiting_admin_approval'::text, 'approved'::text, 'completed'::text, 'cancelled'::text])),
  design_drafts_id uuid,
  draft_delivery_method text CHECK (draft_delivery_method = ANY (ARRAY['email'::text, 'upload'::text])),
  order_status USER-DEFINED DEFAULT 'pending'::order_status_enum,
  is_admin_reservation boolean DEFAULT false,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT orders_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_auth(id),
  CONSTRAINT orders_design_drafts_id_fkey FOREIGN KEY (design_drafts_id) REFERENCES public.design_drafts(id),
  CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
  CONSTRAINT fk_orders_user_auth_id FOREIGN KEY (user_auth_id) REFERENCES public.user_auth(id)
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
  panel_id uuid,
  slot_number integer,
  usage_type text,
  attach_date_from date,
  unit_price numeric CHECK (unit_price >= 0::numeric),
  is_active boolean DEFAULT true,
  is_closed boolean DEFAULT false,
  banner_type USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  banner_slot_id uuid,
  CONSTRAINT panel_slot_usage_pkey PRIMARY KEY (id),
  CONSTRAINT panel_slot_usage_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_slot_usage_panel_info_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id),
  CONSTRAINT panel_slot_usage_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id),
  CONSTRAINT panel_slot_usage_banner_slot_id_fkey FOREIGN KEY (banner_slot_id) REFERENCES public.banner_slots(id)
);
CREATE TABLE public.panels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid,
  region_gu_id uuid,
  region_dong_id uuid,
  nickname text NOT NULL,
  address text,
  photo_url text,
  latitude numeric,
  longitude numeric,
  panel_status USER-DEFINED DEFAULT 'active'::panel_status_enum,
  maintenance_notes text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  panel_code smallint CHECK (panel_code >= 1 AND panel_code <= 100),
  panel_type USER-DEFINED,
  max_banner integer DEFAULT 1,
  notes text,
  CONSTRAINT panels_pkey PRIMARY KEY (id),
  CONSTRAINT panels_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT panels_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT panels_region_dong_id_fkey FOREIGN KEY (region_dong_id) REFERENCES public.region_dong(id)
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
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'pending_deposit'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text])),
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
CREATE TABLE public.public_design_contents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  design_contents_type USER-DEFINED NOT NULL,
  title text,
  location text,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_urls ARRAY DEFAULT '{}'::text[],
  parent_id uuid,
  project_category USER-DEFINED NOT NULL,
  CONSTRAINT public_design_contents_pkey PRIMARY KEY (id)
);
ALTER TABLE public.public_design_contents
  ADD CONSTRAINT public_design_contents_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES public.public_design_contents(id);
CREATE TABLE public.digital_media_signages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  district_code character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  operating_lineup text,
  model_name text,
  product_size text,
  resolution_brightness text,
  key_features text,
  usage text,
  installation_method text,
  inquiry_phone character varying,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT digital_media_billboards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.digital_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_code character varying NOT NULL UNIQUE,
  product_group_code character varying,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  product_type character varying NOT NULL,
  series_name character varying,
  model_name character varying NOT NULL,
  brand character varying,
  inch_size character varying,
  physical_size character varying,
  resolution character varying,
  brightness character varying,
  specifications text,
  usage text,
  installation_method text,
  vesa_hole character varying,
  price character varying,
  special_features text,
  description text,
  bracket_note text,
  contact_info character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT digital_signage_products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.digital_media_billboards  (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_code character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  main_image_url text NOT NULL,
  image_urls text[] DEFAULT '{}'::text[],
  operating_lineup text,
  model_name text,
  product_size text,
  resolution_brightness text,
  key_features text,
  usage text,
  installation_method text,
  inquiry_phone character varying,
  description text,
  location text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT media_landscape_displays_pkey PRIMARY KEY (id)
);
CREATE TABLE public.region_dong (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  region_gu_id uuid,
  CONSTRAINT region_dong_pkey PRIMARY KEY (id),
  CONSTRAINT region_dong_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.region_gu (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid NOT NULL,
  is_active USER-DEFINED DEFAULT 'false'::district_status_enum,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  code text,
  name character varying,
  logo_image_url text,
  phone_number text,
  image text,
  CONSTRAINT region_gu_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_display_types_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id)
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
  CONSTRAINT region_gu_display_periods_unique_period UNIQUE (
    display_type_id,
    region_gu_id,
    year_month,
    period
  ),
  CONSTRAINT region_gu_display_periods_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT region_gu_display_periods_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE public.region_gu_guideline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid,
  guideline_image_url ARRAY,
  ai_image_url text,
  guideline_type USER-DEFINED,
  CONSTRAINT region_gu_guideline_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_guideline_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);

CREATE TYPE reservation_status_enum AS ENUM (
  'reserved',
  'confirmed',
  'released',
  'cancelled'
);

CREATE TYPE procurement_status_enum AS ENUM (
  'pending',
  'ordered',
  'received',
  'failed'
);

CREATE TYPE inventory_type_enum AS ENUM (
  'led_display_inventory',
  'banner_slot_inventory',
  'top_fixed_banner_inventory',
  'digital_product_supply',
  'other'
);

CREATE TYPE fulfillment_status_enum AS ENUM (
  'pending',
  'supplier_confirmed',
  'delivered',
  'completed'
);

CREATE TYPE customer_inquiry_product_type_enum AS ENUM (
  'led',
  'top_fixed',
  'digital_media_product',
  'banner'
);

CREATE TABLE public.order_inventory_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_detail_id uuid NOT NULL REFERENCES public.order_details(id),
  inventory_type inventory_type_enum DEFAULT 'other',
  inventory_id uuid,
  reserved_quantity integer NOT NULL DEFAULT 1,
  reservation_status reservation_status_enum DEFAULT 'reserved',
  inventory_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.manual_pricing_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  order_detail_id uuid REFERENCES public.order_details(id),
  admin_profile_id uuid NOT NULL REFERENCES public.admin_profiles(id),
  payment_method_id uuid REFERENCES public.payment_methods(id),
  design_draft_id uuid REFERENCES public.design_drafts(id),
  base_price integer NOT NULL DEFAULT 0,
  advertising_fee integer DEFAULT 0,
  road_usage_fee integer DEFAULT 0,
  administrative_fee integer DEFAULT 0,
  platform_fee integer DEFAULT 0,
  admin_reduction integer DEFAULT 0,
  vat_rate numeric(5,2),
  vat_amount integer,
  total_price integer NOT NULL DEFAULT 0,
  balance_due integer DEFAULT 0,
  is_paid boolean DEFAULT false,
  status text DEFAULT 'pending',
  notes text,
  manual_entry_metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.manual_pricing_lines
  ADD CONSTRAINT manual_pricing_lines_pkey PRIMARY KEY (id);

CREATE TABLE public.product_procurement_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pricing_line_id uuid NOT NULL REFERENCES public.manual_pricing_lines(id),
  product_type customer_inquiry_product_type_enum NOT NULL,
  product_reference_id uuid,
  inventory_type inventory_type_enum,
  inventory_id uuid,
  supplier_name text,
  supplier_order_reference text,
  procurement_status procurement_status_enum DEFAULT 'pending',
  procured_at timestamp with time zone,
  fulfillment_status fulfillment_status_enum DEFAULT 'pending',
  inventory_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.sync_manual_pricing_order_status()
RETURNS trigger AS $$
BEGIN
  IF (NEW.status = 'confirmed' AND NEW.is_paid) THEN
    UPDATE public.orders
    SET payment_status = 'completed'
    WHERE id = NEW.order_id;
  ELSIF (NEW.status = 'cancelled') THEN
    UPDATE public.order_inventory_reservations
    SET reservation_status = 'released'
    WHERE order_detail_id = NEW.order_detail_id;
  ELSE
    UPDATE public.orders
    SET payment_status = 'waiting_admin_approval'
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_manual_pricing_order_status
AFTER INSERT OR UPDATE ON public.manual_pricing_lines
FOR EACH ROW EXECUTE FUNCTION public.sync_manual_pricing_order_status();

CREATE OR REPLACE FUNCTION public.lock_inventory_reservation()
RETURNS trigger AS $$
BEGIN
  IF (NEW.inventory_type = 'led_display_inventory') THEN
    UPDATE public.led_display_inventory
    SET available_faces = GREATEST(available_faces - NEW.reserved_quantity, 0)
    WHERE id = NEW.inventory_id;
  ELSIF (NEW.inventory_type = 'banner_slot_inventory') THEN
    UPDATE public.banner_slot_inventory
    SET is_available = false
    WHERE id = NEW.inventory_id;
  ELSIF (NEW.inventory_type = 'top_fixed_banner_inventory') THEN
    UPDATE public.banner_slot_inventory
    SET is_available = false
    WHERE id = NEW.inventory_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_inventory
AFTER INSERT OR UPDATE ON public.order_inventory_reservations
FOR EACH ROW WHEN (NEW.reservation_status = 'reserved')
EXECUTE FUNCTION public.lock_inventory_reservation();

CREATE TABLE public.top_fixed_banner_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  is_occupied boolean NOT NULL DEFAULT false,
  occupied_slot_id uuid,
  occupied_until date,
  occupied_from date,
  CONSTRAINT top_fixed_banner_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT top_fixed_banner_inventory_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id),
  CONSTRAINT top_fixed_banner_inventory_occupied_slot_id_fkey FOREIGN KEY (occupied_slot_id) REFERENCES public.banner_slots(id)
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
  business_registration_file text,
  phone text NOT NULL,
  email text NOT NULL,
  contact_person_name text NOT NULL,
  fax_number text,
  is_default boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  is_public_institution boolean DEFAULT false,
  is_company boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.user_auth(id)
);

-- 휴대폰 인증 결과(서버 검증 가능) 저장 테이블
-- - phoneVerificationReference 로 API 호출 시 검증에 사용
-- - purpose 별로 발급 가능 (signup / reset_password / profile 등)
-- - expires_at(예: 1시간) 내에는 재인증 없이 재사용 가능
CREATE TYPE phone_verification_purpose_enum AS ENUM (
  'signup',
  'reset_password',
  'profile'
);

CREATE TABLE public.phone_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_auth_id uuid,
  user_profile_id uuid,
  phone text NOT NULL,
  purpose phone_verification_purpose_enum NOT NULL,
  requestno text,
  verified_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_at timestamp with time zone,
  CONSTRAINT phone_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT phone_verifications_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.user_auth(id),
  CONSTRAINT phone_verifications_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);

CREATE INDEX phone_verifications_phone_idx ON public.phone_verifications (phone);
CREATE INDEX phone_verifications_expires_at_idx ON public.phone_verifications (expires_at);
CREATE INDEX phone_verifications_purpose_idx ON public.phone_verifications (purpose);
CREATE INDEX phone_verifications_user_auth_id_idx ON public.phone_verifications (user_auth_id);
CREATE INDEX phone_verifications_user_profile_id_idx ON public.phone_verifications (user_profile_id);

slot_type_enum	manual, semi_automatic, panel, citizen_board	

panel_type_enum	manual, semi_auto, panel, citizen_bulletin-board, bulletin_board, lower_panel, multi_panel, led, fabric, no_lighting, with_lighting	

display_type_enum	banner_display, led_display, public_design, digital_signage, digital_media	

homepage_menu_enum	landing, banner_display, led_display, public_design, digital_signage, main, digital_media	

banner_type_enum	manual, semi_auto, panel, citizen_bulletin_board, with_lighting, no_lighting, top_fixed	

price_unit_enum	15 days, 1 year, 6 months, 3 years, 1 month	

panel_status_enum	active, maintenance, inactive	

payment_method_enum	bank_transfer, card, cash, etc	

cs_category_enum	personal_cs, frequent_questions	

panel_slot_status_enum	available, maintenance, unavailable	

order_status_enum	draft_uploaded, submitted, awaiting_payment, paid, verified, completed, pending	

notice_priority_enum	important, normal	

banner_type_enum_v2	fabric, panel, bulletin-board, top_fixed, cultural-board, top-fixed, bulletin_board, cultural_board	

guideline_category_enum	default, admin, top_fixed, led	

inquiry_status_enum	pending, answered, closed	

guideline_panel_type	lower_panel, multi_panel, bulliten_board, led, panel, top_fixed, admin, commercial, banner	

price_usage_type	default, public_institution, re_order, self_install, reduction_by_admin, rent_place	

panel_type_enums	manual, semi_auto, bulletin_board, cultural_board, lower_panel, multi_panel, led, no_lighting, with_lighting, panel, top_fixed, citizen_board	

banner_type_enums	fabric, panel, bulletin_board, top_fixed, cultural_board, semi_auto	

period_type	first_half, second_half, full_month	

design_contents_type_enum	list, detail	

district_status_enum	true, false, maintenance	

section_type_enum	main, banner_display_part, led_display_part, public_design_part, digital_signage_part	

page_type_enum	landing, banner_display, led_display, public_design, digital_signage	

public_design_category_enum	banner_improvement, env_improvement, public_design, ect