# 결제 플로우 수정 가이드

## 현재 문제점

1. **결제 전에 주문이 생성됨**: 결제 버튼 클릭 시 `/api/orders`를 호출하여 주문을 먼저 생성하고, 그 후 토스 위젯으로 결제 진행
2. **재고가 줄어들지 않음**: 주문이 생성되면 트리거가 재고를 차감해야 하는데 반영되지 않음

## 수정 방안

### 방법 1: 임시 orderId 생성 → 결제 성공 시 실제 주문 생성 (권장)

1. **결제 페이지 (`src/app/payment/page.tsx`)**:

   - 주문 생성 API 호출 제거
   - 임시 orderId 생성 (UUID 또는 타임스탬프 기반)
   - 토스 위젯에 임시 orderId 전달

2. **결제 확인 API (`src/app/api/payment/toss/confirm/route.ts`)**:
   - 토스페이먼츠 결제 확인 성공 후
   - 실제 주문 생성 (`/api/orders` 호출 또는 직접 INSERT)
   - 재고 차감 트리거 자동 실행

### 방법 2: 주문 생성 유지하되 조건부 처리

1. **결제 페이지**: 주문 생성 (payment_status = 'pending')
2. **결제 확인 API**: payment_status를 'completed'로 업데이트
3. **재고 차감**: payment_status가 'completed'일 때만 트리거 실행

## 추천 방법: 방법 1 (임시 orderId 사용)

이유:

- 결제 실패 시 주문 데이터가 남지 않음
- 재고 차감이 실제 결제 완료 시에만 발생
- 데이터 정합성 보장
