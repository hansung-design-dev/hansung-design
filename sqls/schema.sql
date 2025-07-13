-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE admin_auth (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_auth_pkey PRIMARY KEY (id)
);
CREATE TABLE admin_order_verifications (
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
CREATE TABLE admin_profiles (
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
CREATE TABLE bank_info (
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
CREATE TABLE banner_panel_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  panel_info_id uuid NOT NULL UNIQUE,
  is_for_admin boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT banner_panel_details_pkey PRIMARY KEY (id),
  CONSTRAINT banner_panel_details_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE banner_slot_info (
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
CREATE TABLE banner_slot_inventory (
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
CREATE TABLE banner_slot_price_policy (
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
CREATE TABLE customer_inquiries (
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
CREATE TABLE customer_service (
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
CREATE TABLE design_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_profile_id uuid,
  admin_profile_id uuid,
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
  CONSTRAINT design_drafts_admin_profile_id_fkey FOREIGN KEY (admin_profile_id) REFERENCES public.admin_profiles(id),
  CONSTRAINT design_drafts_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE display_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT display_types_pkey PRIMARY KEY (id)
);
CREATE TABLE homepage_contents (
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
CREATE TABLE homepage_menu_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name USER-DEFINED NOT NULL,
  description text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT homepage_menu_types_pkey PRIMARY KEY (id)
);
CREATE TABLE homepage_notice (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  priority USER-DEFINED DEFAULT 'normal'::notice_priority_enum,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT homepage_notice_pkey PRIMARY KEY (id)
);
CREATE TABLE led_panel_details (
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
CREATE TABLE led_slot_info (
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
CREATE TABLE notice_categories (
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
  CONSTRAINT order_details_panel_slot_usage_id_fkey FOREIGN KEY (panel_slot_usage_id) REFERENCES public.panel_slot_usage(id),
  CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_details_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE orders (
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
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.user_auth(id),
  CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
  CONSTRAINT orders_design_drafts_id_fkey FOREIGN KEY (design_drafts_id) REFERENCES public.design_drafts(id),
  CONSTRAINT orders_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE panel_guideline (
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
CREATE TABLE panel_info (
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
CREATE TABLE panel_popup_notices (
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
CREATE TABLE panel_slot_usage (
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
  CONSTRAINT panel_slot_usage_pkey PRIMARY KEY (id),
  CONSTRAINT panel_slot_usage_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_info_id) REFERENCES public.banner_slot_info(id),
  CONSTRAINT panel_slot_usage_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id),
  CONSTRAINT panel_slot_usage_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id)
);
CREATE TABLE payment_methods (
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
CREATE TABLE payments (
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
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);
CREATE TABLE region_dong (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  district_code text NOT NULL,
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT region_dong_pkey PRIMARY KEY (id),
  CONSTRAINT region_dong_district_code_fkey FOREIGN KEY (district_code) REFERENCES public.region_gu(code)
);
CREATE TABLE region_gu (
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
CREATE TABLE region_gu_display_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_type_id uuid,
  region_gu_id uuid,
  period_from date,
  period_to date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  year_month character varying NOT NULL,
  half_period text CHECK (half_period = ANY (ARRAY['first_half'::text, 'second_half'::text])),
  CONSTRAINT region_gu_display_periods_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_display_periods_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id),
  CONSTRAINT region_gu_display_periods_display_type_id_fkey FOREIGN KEY (display_type_id) REFERENCES public.display_types(id)
);
CREATE TABLE region_gu_guideline (
  id uuid NOT NULL,
  region_gu_id uuid,
  display_type USER-DEFINED NOT NULL,
  category USER-DEFINED DEFAULT 'default'::guideline_category_enum,
  title text,
  description text,
  image_urls ARRAY,
  content_json jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT region_gu_guideline_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_guideline_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);
CREATE TABLE top_fixed_banner_inventory (
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
  CONSTRAINT top_fixed_banner_inventory_panel_info_id_fkey FOREIGN KEY (panel_info_id) REFERENCES public.panel_info(id),
  CONSTRAINT top_fixed_banner_inventory_banner_slot_info_id_fkey FOREIGN KEY (banner_slot_info_id) REFERENCES public.banner_slot_info(id),
  CONSTRAINT top_fixed_banner_inventory_region_gu_display_period_id_fkey FOREIGN KEY (region_gu_display_period_id) REFERENCES public.region_gu_display_periods(id)
);
CREATE TABLE user_auth (
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
CREATE TABLE user_profiles (
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