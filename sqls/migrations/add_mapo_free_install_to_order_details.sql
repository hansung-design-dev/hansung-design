-- 마포구 저단형 무료 설치 (행정용) 컬럼 추가
-- 조건: 행정용 계정 + 마포구 + 저단형일 때 체크 시 0원 주문 가능

ALTER TABLE order_details
ADD COLUMN IF NOT EXISTS mapo_free_install BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN order_details.mapo_free_install IS '마포구 저단형 무료 설치 (행정용)';
