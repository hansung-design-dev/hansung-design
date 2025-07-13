-- 어드민 인증 테이블
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

-- 어드민 프로필 테이블
CREATE TABLE admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_auth_id uuid NOT NULL,
  name text NOT NULL,
  department text, -- 부서 (영업팀, 디자인팀, 관리팀 등)
  position text, -- 직급 (팀장, 대리, 사원 등)
  phone text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'designer', 'sales')),
  permissions jsonb DEFAULT '{}', -- 권한 정보 (JSON)
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT admin_profiles_admin_auth_id_fkey FOREIGN KEY (admin_auth_id) REFERENCES admin_auth(id) ON DELETE CASCADE
);

-- 시안 교환 통합 테이블
CREATE TABLE design_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_profile_id uuid, -- 사용자 프로필 (NULL이면 어드민)
  admin_profile_id uuid, -- 어드민 프로필 (NULL이면 사용자)
  file_name text,
  file_url text,
  file_extension text,
  file_size integer,
  draft_category text NOT NULL DEFAULT 'initial' CHECK (draft_category IN ('initial', 'feedback', 'revision', 'final')),
  notes text, -- 발신자 메모
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT design_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT design_drafts_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT design_drafts_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id),
  CONSTRAINT design_drafts_admin_profile_id_fkey FOREIGN KEY (admin_profile_id) REFERENCES admin_profiles(id),
  -- 사용자 또는 어드민 중 하나만 가능
  CONSTRAINT design_drafts_profile_check CHECK (
    (user_profile_id IS NOT NULL AND admin_profile_id IS NULL) OR
    (user_profile_id IS NULL AND admin_profile_id IS NOT NULL)
  )
);



-- 결제수단 테이블
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

-- 결제 정보 테이블
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  payment_method_id uuid NOT NULL,
  payment_provider text,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_id text,
  payment_date timestamp with time zone,
  admin_approval_status text DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  depositor_name text,
  deposit_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id)
);

-- 주문 검증 정보 테이블
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
  verified_by uuid, -- admin_profiles.id 참조
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  
  CONSTRAINT admin_order_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT admin_order_verifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT admin_order_verifications_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.admin_profiles(id)
);

-- orders 테이블 정리 및 새로운 컬럼 추가

-- 1. 기존 orders 테이블에서 불필요한 컬럼 삭제
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS total_price,
DROP COLUMN IF EXISTS depositor_name,
DROP COLUMN IF EXISTS deposit_date,
DROP COLUMN IF EXISTS is_paid,
DROP COLUMN IF EXISTS is_checked,
DROP COLUMN IF EXISTS invoice_issued_at,
DROP COLUMN IF EXISTS invoice_file,
DROP COLUMN IF EXISTS payment_method,
DROP COLUMN IF EXISTS is_received_order,
DROP COLUMN IF EXISTS is_received_paymenet,
DROP COLUMN IF EXISTS is_draft_sent,
DROP COLUMN IF EXISTS is_draft_received,
DROP COLUMN IF EXISTS is_address_verified,
DROP COLUMN IF EXISTS is_draft_verified,
DROP COLUMN IF EXISTS display_location,
DROP COLUMN IF EXISTS received_payment_at;

-- 2. 새로운 결제 및 시안 관련 컬럼 추가
ALTER TABLE orders 
ADD COLUMN payment_method_id uuid,
ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'waiting_admin_approval', 'approved', 'completed', 'cancelled')),
ADD COLUMN design_drafts_id uuid REFERENCES design_drafts(id),
ADD CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);
ADD CONSTRAINT orders_latest_draft_id_fkey FOREIGN KEY (latest_draft_id) REFERENCES public.design_drafts(id);

-- 기본 어드민 데이터 삽입
INSERT INTO public.admin_auth (email, password_hash) VALUES
('admin@hansung.com', '$2b$10$default_hash_here'); -- 실제 해시로 변경 필요

INSERT INTO public.admin_profiles (admin_auth_id, name, department, position, role) VALUES
((SELECT id FROM admin_auth WHERE email = 'admin@hansung.com'), '관리자', '관리팀', '팀장', 'super_admin');

-- 기본 결제수단 데이터 삽입
INSERT INTO public.payment_methods (name, method_type, method_code, description, is_online, requires_admin_approval) VALUES
('신용카드', 'credit_card', 'credit_card', '신용카드 결제', true, false),
('계좌이체', 'bank_transfer', 'bank_transfer', '계좌이체', true, false),
('카카오페이', 'kakao_pay', 'kakao_pay', '카카오페이', true, false),
('네이버페이', 'naver_pay', 'naver_pay', '네이버페이', true, false),
('어드민 승인', 'admin_approval', 'admin_approval', '공공기관/기관용 어드민 승인', false, true);

-- 인덱스 생성
CREATE INDEX idx_admin_auth_email ON public.admin_auth(email);
CREATE INDEX idx_admin_profiles_admin_auth_id ON public.admin_profiles(admin_auth_id);
CREATE INDEX idx_admin_profiles_role ON public.admin_profiles(role);
CREATE INDEX idx_design_drafts_order_id ON public.design_drafts(order_id);
CREATE INDEX idx_design_drafts_user_profile_id ON public.design_drafts(user_profile_id);
CREATE INDEX idx_design_drafts_admin_profile_id ON public.design_drafts(admin_profile_id);
CREATE INDEX idx_design_drafts_draft_category ON public.design_drafts(draft_category);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_payment_method_id ON public.payments(payment_method_id);
CREATE INDEX idx_payments_payment_provider ON public.payments(payment_provider);
CREATE INDEX idx_payment_methods_method_type ON public.payment_methods(method_type);
CREATE INDEX idx_payment_methods_is_online ON public.payment_methods(is_online);
CREATE INDEX idx_admin_order_verifications_order_id ON public.admin_order_verifications(order_id);
CREATE INDEX idx_admin_order_verifications_verified_by ON public.admin_order_verifications(verified_by);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_admin_approval_status ON public.orders(admin_approval_status);
CREATE INDEX idx_orders_draft_status ON public.orders(draft_status);
CREATE INDEX idx_orders_latest_draft_id ON public.orders(latest_draft_id); 