# 결제 플로우 및 재고 문제 해결 가이드

## 문제 1: 결제 전에 주문 생성됨

### 현재 플로우

1. 결제 버튼 클릭 → `/api/orders` 호출하여 주문 생성
2. 주문 생성 성공 → 토스 위젯으로 결제 진행
3. 결제 성공 → 결제 확인 API에서 `payment_status`만 업데이트

### 수정 방안

결제 페이지 (`src/app/payment/page.tsx`)에서:

- 주문 생성 API 호출 제거
- 임시 orderId 생성 (예: `temp_${Date.now()}_${random}`)
- 결제 정보를 localStorage에 저장
- 토스 위젯에 임시 orderId 전달

결제 확인 API (`src/app/api/payment/toss/confirm/route.ts`)에서:

- 토스페이먼츠 결제 확인 성공 후
- localStorage에서 결제 정보 조회 (또는 클라이언트에서 전달받기)
- 실제 주문 생성 (`/api/orders` 호출)
- 재고 차감 트리거 자동 실행

## 문제 2: 재고 감소가 게시대 리스트에 반영되지 않음

### 확인 사항

1. 트리거가 제대로 실행되는지 확인

   - `order_details` INSERT 시 `banner_inventory_insert_trigger` 실행 여부
   - `update_banner_slot_inventory_on_order` 함수 실행 여부

2. 게시대 리스트 API가 재고 정보를 제대로 조회하는지 확인
   - `/api/banner-display` API에서 `banner_slot_inventory` 조회 로직 확인
   - `is_available`, `is_closed` 필드 반영 여부

### 수정 방법

1. **트리거 확인**:

```sql
-- 트리거가 활성화되어 있는지 확인
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
AND tgname LIKE '%inventory%';

-- 트리거 비활성화되어 있다면 활성화
ALTER TABLE order_details ENABLE TRIGGER banner_inventory_insert_trigger;
```

2. **재고 조회 로직 확인**:

- `/api/banner-display/route.ts`에서 `banner_slot_inventory` 조회 시 `is_closed = true`인 경우 필터링
- 슬롯별 재고 정보가 `slot_inventory`에 제대로 매핑되는지 확인

## 삭제 쿼리 수정

`DELETE_ALL_TEST_DATA.sql`에서 외래키 제약조건 순서 수정 완료:

1. `order_details` 삭제
2. `orders.design_drafts_id`를 NULL로 설정
3. `orders` 삭제
4. `panel_slot_usage` 삭제 (주문과 연결된 것만)
5. `design_drafts` 삭제
