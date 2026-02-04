-- Migration: Add refunds and additional_payments tables
-- Date: 2026-02-04
-- Description: 환불 및 추가 결제 이력 추적을 위한 테이블 생성

-- ============================================
-- 1. refunds 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_detail_id UUID REFERENCES public.order_details(id) ON DELETE SET NULL,

  -- 환불 금액
  refund_amount NUMERIC NOT NULL CHECK (refund_amount > 0),

  -- 환불 방식
  refund_method TEXT NOT NULL CHECK (refund_method IN ('pg_auto', 'bank_transfer', 'other')),
  -- pg_auto: 토스페이먼츠 API 자동 환불
  -- bank_transfer: 수동 계좌이체
  -- other: 기타

  -- 환불 상태
  refund_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
  -- pending: 환불 대기
  -- processing: 환불 처리 중
  -- completed: 환불 완료
  -- failed: 환불 실패

  -- PG사 환불 정보 (자동 환불 시)
  pg_refund_key TEXT,           -- 토스 환불 키
  pg_transaction_id TEXT,       -- PG사 거래 ID

  -- 수동 환불 정보 (계좌이체 시)
  bank_name TEXT,               -- 환불 은행
  account_number TEXT,          -- 환불 계좌번호
  account_holder TEXT,          -- 예금주

  -- 환불 사유 및 메모
  refund_reason TEXT,           -- 환불 사유
  admin_notes TEXT,             -- 관리자 메모

  -- 처리자 정보
  processed_by UUID,            -- 처리한 관리자 ID
  processed_at TIMESTAMP WITH TIME ZONE, -- 환불 처리 완료 시간

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- refunds 인덱스
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(refund_status);

-- ============================================
-- 2. additional_payments 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS public.additional_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_detail_id UUID REFERENCES public.order_details(id) ON DELETE SET NULL,

  -- 추가 결제 금액
  additional_amount NUMERIC NOT NULL CHECK (additional_amount > 0),

  -- 추가 결제 방식
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pg_auto', 'bank_transfer', 'other')),
  -- pg_auto: 고객이 결제 링크로 직접 결제
  -- bank_transfer: 계좌이체 후 어드민 확인
  -- other: 기타

  -- 추가 결제 상태
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'awaiting_payment', 'completed', 'failed', 'cancelled')),
  -- pending: 추가 결제 대기 (어드민에서 생성)
  -- awaiting_payment: 결제 대기 중 (고객에게 링크 전송됨)
  -- completed: 결제 완료
  -- failed: 결제 실패
  -- cancelled: 취소됨

  -- PG사 결제 정보 (자동 결제 시)
  pg_payment_key TEXT,          -- 토스 결제 키
  pg_transaction_id TEXT,       -- PG사 거래 ID

  -- 수동 결제 정보 (계좌이체 시)
  depositor_name TEXT,          -- 입금자명
  deposit_date TIMESTAMP WITH TIME ZONE, -- 입금 확인 일시

  -- 결제 링크 (고객 직접 결제 시)
  payment_link_url TEXT,        -- 결제 링크 URL
  payment_link_expires_at TIMESTAMP WITH TIME ZONE, -- 링크 만료 시간

  -- 사유 및 메모
  reason TEXT,                  -- 추가 결제 사유
  admin_notes TEXT,             -- 관리자 메모

  -- 처리자 정보
  processed_by UUID,            -- 처리한 관리자 ID
  processed_at TIMESTAMP WITH TIME ZONE, -- 결제 완료 시간

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- additional_payments 인덱스
CREATE INDEX IF NOT EXISTS idx_additional_payments_payment_id ON public.additional_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_additional_payments_order_id ON public.additional_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_additional_payments_status ON public.additional_payments(payment_status);

-- ============================================
-- 3. payments 테이블에 집계 필드 추가
-- ============================================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS total_refunded NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_additional_paid NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_payment_count INTEGER DEFAULT 0;

-- ============================================
-- 4. updated_at 자동 갱신 트리거
-- ============================================

-- refunds 테이블 트리거
CREATE OR REPLACE FUNCTION update_refunds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refunds_updated_at ON public.refunds;
CREATE TRIGGER trigger_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_refunds_updated_at();

-- additional_payments 테이블 트리거
CREATE OR REPLACE FUNCTION update_additional_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_additional_payments_updated_at ON public.additional_payments;
CREATE TRIGGER trigger_additional_payments_updated_at
  BEFORE UPDATE ON public.additional_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_additional_payments_updated_at();

-- ============================================
-- 5. payments 집계 필드 자동 업데이트 트리거
-- ============================================

-- 환불 완료 시 payments.total_refunded 업데이트
CREATE OR REPLACE FUNCTION update_payments_refund_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- 환불 상태가 completed로 변경되었을 때만 업데이트
  IF (TG_OP = 'INSERT' AND NEW.refund_status = 'completed') OR
     (TG_OP = 'UPDATE' AND NEW.refund_status = 'completed' AND OLD.refund_status != 'completed') THEN
    UPDATE public.payments
    SET
      total_refunded = COALESCE(total_refunded, 0) + NEW.refund_amount,
      refund_count = COALESCE(refund_count, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.payment_id;
  END IF;

  -- 환불 상태가 completed에서 다른 상태로 변경되었을 때 롤백
  IF TG_OP = 'UPDATE' AND OLD.refund_status = 'completed' AND NEW.refund_status != 'completed' THEN
    UPDATE public.payments
    SET
      total_refunded = GREATEST(COALESCE(total_refunded, 0) - OLD.refund_amount, 0),
      refund_count = GREATEST(COALESCE(refund_count, 0) - 1, 0),
      updated_at = NOW()
    WHERE id = NEW.payment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payments_refund_totals ON public.refunds;
CREATE TRIGGER trigger_update_payments_refund_totals
  AFTER INSERT OR UPDATE ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_refund_totals();

-- 추가 결제 완료 시 payments.total_additional_paid 업데이트
CREATE OR REPLACE FUNCTION update_payments_additional_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- 결제 상태가 completed로 변경되었을 때만 업데이트
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'completed') OR
     (TG_OP = 'UPDATE' AND NEW.payment_status = 'completed' AND OLD.payment_status != 'completed') THEN
    UPDATE public.payments
    SET
      total_additional_paid = COALESCE(total_additional_paid, 0) + NEW.additional_amount,
      additional_payment_count = COALESCE(additional_payment_count, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.payment_id;
  END IF;

  -- 결제 상태가 completed에서 다른 상태로 변경되었을 때 롤백
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
    UPDATE public.payments
    SET
      total_additional_paid = GREATEST(COALESCE(total_additional_paid, 0) - OLD.additional_amount, 0),
      additional_payment_count = GREATEST(COALESCE(additional_payment_count, 0) - 1, 0),
      updated_at = NOW()
    WHERE id = NEW.payment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payments_additional_totals ON public.additional_payments;
CREATE TRIGGER trigger_update_payments_additional_totals
  AFTER INSERT OR UPDATE ON public.additional_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_additional_totals();

-- ============================================
-- 6. RLS (Row Level Security) 정책 (선택사항)
-- ============================================
-- 필요 시 활성화
-- ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.additional_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 완료
-- ============================================
