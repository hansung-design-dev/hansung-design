-- orders 테이블 리팩토링 - 관심사 분리

-- 1. 주문 검증 테이블 생성 (어드민 검증 사항들)
CREATE TABLE public.order_verifications (
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
  verified_by uuid, -- 어드민 ID (필요시)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT order_verifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- 2. payments 테이블에 컬럼 추가
ALTER TABLE public.payments 
ADD COLUMN depositor_name text,
ADD COLUMN deposit_date date;

-- 3. drafts 테이블에 display_location 추가
ALTER TABLE public.drafts 
ADD COLUMN display_location text;

-- 4. 기존 orders 테이블에서 데이터 마이그레이션
-- 4-1. order_verifications로 데이터 이동
INSERT INTO public.order_verifications (
  order_id,
  is_paid,
  is_checked,
  is_received_order,
  is_received_payment,
  is_draft_sent,
  is_draft_received,
  is_address_verified,
  is_draft_verified,
  received_payment_at
)
SELECT 
  id as order_id,
  is_paid,
  is_checked,
  is_received_order,
  is_received_paymenet, -- 오타 수정
  is_draft_sent,
  is_draft_received,
  is_address_verified,
  is_draft_verified,
  received_payment_at
FROM public.orders
WHERE id IN (SELECT id FROM public.orders);

-- 4-2. payments 테이블에 기존 결제 정보 이동 (payment_method가 있는 경우)
INSERT INTO public.payments (
  order_id,
  payment_method_id,
  amount,
  depositor_name,
  deposit_date,
  payment_status,
  payment_date
)
SELECT 
  o.id as order_id,
  pm.id as payment_method_id,
  o.total_price as amount,
  o.depositor_name,
  o.deposit_date,
  CASE 
    WHEN o.is_paid THEN 'completed'
    WHEN o.payment_method IS NOT NULL THEN 'pending'
    ELSE 'pending'
  END as payment_status,
  o.received_payment_at as payment_date
FROM public.orders o
LEFT JOIN public.payment_methods pm ON pm.code = o.payment_method
WHERE o.payment_method IS NOT NULL OR o.total_price IS NOT NULL;

-- 5. orders 테이블에서 불필요한 컬럼 제거
ALTER TABLE public.orders 
DROP COLUMN panel_slot_snapshot,
DROP COLUMN total_price,
DROP COLUMN depositor_name,
DROP COLUMN deposit_date,
DROP COLUMN is_paid,
DROP COLUMN is_checked,
DROP COLUMN invoice_issued_at,
DROP COLUMN invoice_file,
DROP COLUMN payment_method,
DROP COLUMN is_received_order,
DROP COLUMN is_received_paymenet,
DROP COLUMN is_draft_sent,
DROP COLUMN is_draft_received,
DROP COLUMN is_address_verified,
DROP COLUMN is_draft_verified,
DROP COLUMN display_location,
DROP COLUMN received_payment_at;

-- 6. orders 테이블에 기본 상태 컬럼 추가
ALTER TABLE public.orders 
ADD COLUMN order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
ADD COLUMN admin_approval_required boolean DEFAULT false,
ADD COLUMN admin_approval_status text DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN admin_notes text,
ADD COLUMN draft_upload_required boolean DEFAULT true;

-- 7. 인덱스 생성
CREATE INDEX idx_order_verifications_order_id ON public.order_verifications(order_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_drafts_order_id ON public.drafts(order_id);
CREATE INDEX idx_orders_order_status ON public.orders(order_status);
CREATE INDEX idx_orders_admin_approval_status ON public.orders(admin_approval_status);

-- 8. 확인용 쿼리
-- SELECT 
--   o.id,
--   o.order_number,
--   o.order_status,
--   ov.is_paid,
--   ov.is_checked,
--   p.amount as total_price,
--   p.payment_status,
--   d.display_location
-- FROM public.orders o
-- LEFT JOIN public.order_verifications ov ON o.id = ov.order_id
-- LEFT JOIN public.payments p ON o.id = p.order_id
-- LEFT JOIN public.drafts d ON o.id = d.order_id
-- LIMIT 5; 