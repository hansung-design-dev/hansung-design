# 한성웹 프로젝트 데이터베이스 스키마

## 개요

광고 패널 관리 시스템의 데이터베이스 스키마입니다. 시안관리, 결제, 주문 검증 기능을 포함합니다.

## 테이블 구조

### 1. 시안관리 테이블 (`design_drafts`)

**목적**: 사용자와 어드민 간의 시안 파일 교환 및 승인 관리

**주요 필드**:

- `id`: UUID (Primary Key)
- `order_id`: 주문 ID (Foreign Key)
- `user_auth_id`: 사용자 ID (Foreign Key)
- `draft_type`: 시안 타입 ('email', 'upload')
- `direction`: 방향 ('user_to_admin', 'admin_to_user')
- `draft_category`: 시안 카테고리 ('initial', 'feedback', 'revision', 'final')
- `upload_status`: 업로드 상태 ('pending', 'uploaded', 'approved', 'rejected')
- `file_name`, `file_url`, `file_extension`, `file_size`: 파일 정보
- `admin_id`: 어드민 ID (Foreign Key)
- `admin_notes`, `user_notes`: 메모
- `is_approved`: 승인 여부

**인덱스**:

- `idx_design_drafts_order_id`
- `idx_design_drafts_user_auth_id`
- `idx_design_drafts_admin_id`

### 2. 결제수단 테이블 (`payment_methods`)

**목적**: 지원하는 결제수단 관리

**주요 필드**:

- `id`: UUID (Primary Key)
- `name`: 결제수단명
- `method_type`: 결제수단 타입 (text)
- `method_code`: 결제수단 코드 (Unique)
- `is_online`: 온라인 결제 가능 여부
- `requires_admin_approval`: 어드민 승인 필요 여부
- `is_active`: 활성화 여부

**기본 데이터**:

- 신용카드 (credit_card)
- 계좌이체 (bank_transfer)
- 카카오페이 (kakao_pay)
- 네이버페이 (naver_pay)
- 어드민 승인 (admin_approval)

**인덱스**:

- `idx_payment_methods_method_type`
- `idx_payment_methods_is_online`

### 3. 결제 정보 테이블 (`payments`)

**목적**: 실제 결제 내역 저장

**주요 필드**:

- `id`: UUID (Primary Key)
- `order_id`: 주문 ID (Foreign Key)
- `payment_method`: 결제수단
- `payment_provider`: 결제 제공업체 (naver_pay, kakao_pay 등)
- `primary_pay_means`: 주 결제 수단 (CARD, BANK, POINT 등)
- `card_corp_code`, `card_corp_name`: 카드사 정보
- `amount`: 결제 금액
- `payment_status`: 결제 상태 ('pending', 'completed', 'failed', 'cancelled', 'refunded')
- `transaction_id`: 거래 ID
- `payment_date`: 결제일시
- `depositor_name`, `deposit_date`: 입금자 정보 (계좌이체용)
- `admin_approval_status`: 어드민 승인 상태
- `admin_notes`: 어드민 메모

**인덱스**:

- `idx_payments_order_id`
- `idx_payments_payment_method`
- `idx_payments_payment_provider`
- `idx_payments_primary_pay_means`

### 4. 주문 검증 정보 테이블 (`order_verifications`)

**목적**: 어드민이 주문 상태를 검증하고 관리

**주요 필드**:

- `id`: UUID (Primary Key)
- `order_id`: 주문 ID (Foreign Key)
- `is_paid`: 결제 확인 여부
- `is_checked`: 검토 완료 여부
- `is_received_order`: 주문 접수 확인
- `is_received_payment`: 결제 접수 확인
- `is_draft_sent`: 시안 발송 확인
- `is_draft_received`: 시안 접수 확인
- `is_address_verified`: 주소 검증 완료
- `is_draft_verified`: 시안 검증 완료
- `received_payment_at`: 결제 접수일시
- `verified_by`: 검증자 ID (Foreign Key)
- `admin_notes`: 어드민 메모

**인덱스**:

- `idx_order_verifications_order_id`
- `idx_order_verifications_verified_by`

### 5. 주문 테이블 확장 (`orders`)

**추가된 컬럼**:

- `payment_method`: 결제수단
- `payment_status`: 결제 상태 ('pending', 'waiting_admin_approval', 'approved', 'completed', 'cancelled')
- `admin_approval_required`: 어드민 승인 필요 여부
- `admin_approval_status`: 어드민 승인 상태 ('pending', 'approved', 'rejected')
- `admin_notes`: 어드민 메모
- `draft_upload_required`: 시안 업로드 필요 여부

**인덱스**:

- `idx_orders_payment_status`
- `idx_orders_admin_approval_status`

## 결제 플로우

### 일반 사용자 플로우

1. 장바구니에 상품 추가
2. 결제 페이지에서 결제수단 선택
3. 온라인 결제 진행 (신용카드, 카카오페이, 네이버페이)
4. 결제 완료 후 시안 업로드
5. 어드민 검토 및 피드백

### 공공기관/기관용 플로우

1. 장바구니에 상품 추가
2. 어드민 승인 요청
3. 어드민 승인 후 결제 진행
4. 시안 업로드
5. 어드민 검토 및 피드백

### 계좌이체 플로우

1. 장바구니에 상품 추가
2. 계좌이체 선택
3. 입금 정보 확인
4. 어드민이 입금 확인 후 결제 완료 처리
5. 시안 업로드

## 시안 관리 플로우

### 양방향 시안 교환

- **사용자 → 어드민**: 초안 제출, 수정안 제출
- **어드민 → 사용자**: 피드백 제공, 최종 승인

### 시안 카테고리

- `initial`: 초안
- `feedback`: 피드백
- `revision`: 수정안
- `final`: 최종안

### 시안 상태

- `pending`: 대기중
- `uploaded`: 업로드됨
- `approved`: 승인됨
- `rejected`: 거부됨

## 결제수단별 데이터 저장 예시

### 네이버페이 결제

```sql
INSERT INTO payments (
  payment_method,
  payment_provider,
  primary_pay_means,
  card_corp_code,
  card_corp_name,
  amount,
  transaction_id
) VALUES (
  'naver_pay',
  'naver_pay',
  'CARD',
  'KB',
  'KB국민카드',
  50000,
  'naver_tx_123456'
);
```

### 계좌이체

```sql
INSERT INTO payments (
  payment_method,
  payment_provider,
  primary_pay_means,
  amount,
  depositor_name,
  deposit_date,
  payment_status
) VALUES (
  'bank_transfer',
  'bank_transfer',
  'BANK',
  50000,
  '홍길동',
  '2024-01-15 14:30:00',
  'pending'
);
```

## 주의사항

1. **결제수단 enum**: 현재는 text 타입을 사용하여 유연성을 확보했습니다. 필요시 enum으로 변경 가능합니다.

2. **외래키 제약조건**: 모든 테이블에 적절한 외래키 제약조건이 설정되어 있습니다.

3. **인덱스**: 조회 성능을 위해 주요 필드에 인덱스가 생성되어 있습니다.

4. **확장성**: 새로운 결제수단이나 시안 타입을 쉽게 추가할 수 있도록 설계되었습니다.
