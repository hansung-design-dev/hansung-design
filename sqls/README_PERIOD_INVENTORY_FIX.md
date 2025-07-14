# 기간별 재고 관리 문제 해결 가이드

## 🎯 문제 상황

사용자가 특정 기간(상반기/하반기)에 신청했는데 **전체 기간의 재고가 빠지는** 문제가 발생했습니다.

## 🔍 문제 원인 분석

### 1. 주문 API 문제

- `selectedPeriodFrom`/`selectedPeriodTo` 대신 `halfPeriod`로 계산된 날짜를 사용
- 실제 선택된 기간과 저장되는 기간이 불일치

### 2. 트리거 함수 문제

- `display_start_date`만으로 기간을 찾아서 정확하지 않음
- 기간 겹침 로직이 부족

### 3. 재고 감소 문제

- 전체 기간의 재고가 감소하는 문제

## ✅ 해결 방법

### 1. SQL 파일 적용

```sql
-- sqls/fix_period_inventory_issue.sql 파일을 Supabase SQL Editor에서 실행
```

### 2. API 라우트 적용 (선택사항)

```bash
# 새로운 API 라우트로 수정 적용
curl -X POST http://localhost:3000/api/fix-inventory-new
```

### 3. 주문 API 수정 (선택사항)

기존 `src/app/api/orders/route.ts`를 `src/app/api/orders/route_fixed.ts`로 교체

## 🚀 주요 개선사항

### 1. 정확한 기간 매칭

```sql
-- 기존: display_start_date만 사용
AND NEW.display_start_date >= rgdp.period_from
AND NEW.display_start_date <= rgdp.period_to

-- 개선: display_start_date + display_end_date 사용
AND (
  -- 기간이 완전히 겹치는 경우
  (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
  OR
  -- 기간이 부분적으로 겹치는 경우
  (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
)
```

### 2. 주문 API 개선

```typescript
// 기간 설정 - selectedPeriodFrom/selectedPeriodTo 우선 사용
if (item.selectedPeriodFrom && item.selectedPeriodTo) {
  // 선택된 기간이 있으면 그것을 사용
  displayStartDate = item.selectedPeriodFrom;
  displayEndDate = item.selectedPeriodTo;
} else if (item.halfPeriod && item.selectedYear && item.selectedMonth) {
  // 없으면 halfPeriod로 계산
  // ...
}
```

### 3. 디버깅 유틸리티 추가

```sql
-- 기간 매칭 디버깅 함수
SELECT * FROM debug_order_period_matching(
  'panel_info_id_here',
  '2025-08-01'::DATE,
  '2025-08-15'::DATE
);

-- 재고 현황 확인 함수
SELECT * FROM get_inventory_status('panel_info_id_here');
```

## 📋 적용 순서

### 1단계: SQL 파일 실행

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `sqls/fix_period_inventory_issue.sql` 파일 내용 복사
4. 실행

### 2단계: 확인

```sql
-- 트리거 확인
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%inventory%';

-- 함수 확인
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%inventory%';
```

### 3단계: 테스트

```sql
-- 테스트 주문 생성 후 재고 확인
SELECT * FROM get_inventory_status();

-- 특정 패널의 재고 확인
SELECT * FROM get_inventory_status('your_panel_info_id');
```

## 🔧 유틸리티 함수

### 1. 디버깅 함수

```sql
-- 주문 기간과 DB 기간 매칭 확인
SELECT * FROM debug_order_period_matching(
  'panel_info_id',
  '2025-08-01',
  '2025-08-15'
);
```

### 2. 재고 현황 함수

```sql
-- 전체 재고 현황
SELECT * FROM get_inventory_status();

-- 특정 패널 재고 현황
SELECT * FROM get_inventory_status('panel_info_id');
```

### 3. 재고 현황 뷰

```sql
-- 기간별 재고 현황 뷰
SELECT * FROM inventory_status_view
ORDER BY year_month DESC, period;
```

## 📊 성능 최적화

### 인덱스 추가

```sql
-- 재고 조회 성능 향상
CREATE INDEX idx_banner_slot_inventory_panel_period
ON banner_slot_inventory(panel_info_id, region_gu_display_period_id);

-- 주문 조회 성능 향상
CREATE INDEX idx_order_details_display_dates
ON order_details(panel_info_id, display_start_date, display_end_date);

-- 기간 조회 성능 향상
CREATE INDEX idx_region_gu_display_periods_dates
ON region_gu_display_periods(region_gu_id, display_type_id, period_from, period_to);
```

## 🚨 주의사항

### 1. 기존 데이터

- 기존 주문 데이터는 영향받지 않음
- 새로운 주문부터 수정된 로직 적용

### 2. 롤백 방법

```sql
-- 트리거 삭제
DROP TRIGGER IF EXISTS banner_inventory_insert_trigger ON order_details;
DROP TRIGGER IF EXISTS banner_inventory_delete_trigger ON order_details;
DROP TRIGGER IF EXISTS inventory_check_trigger ON order_details;

-- 함수 삭제
DROP FUNCTION IF EXISTS update_banner_slot_inventory_on_order();
DROP FUNCTION IF EXISTS restore_banner_slot_inventory_on_order_delete();
DROP FUNCTION IF EXISTS check_inventory_before_order();
```

### 3. 모니터링

```sql
-- 로그 확인 (Supabase Logs)
-- 트리거 실행 로그 확인
-- 재고 변경 이력 확인
```

## ✅ 검증 방법

### 1. 기능 테스트

1. 상반기 주문 생성
2. 해당 기간의 재고만 감소하는지 확인
3. 하반기 주문 생성
4. 다른 기간 재고는 영향받지 않는지 확인

### 2. 데이터 검증

```sql
-- 주문 전후 재고 비교
SELECT
  panel_info_id,
  region_gu_display_period_id,
  available_slots,
  closed_slots,
  updated_at
FROM banner_slot_inventory
WHERE panel_info_id = 'test_panel_id'
ORDER BY updated_at DESC;
```

## 📞 문제 발생 시

### 1. 로그 확인

- Supabase Dashboard > Logs
- 트리거 실행 로그 확인
- 오류 메시지 확인

### 2. 디버깅

```sql
-- 기간 매칭 문제 확인
SELECT * FROM debug_order_period_matching(
  'problematic_panel_id',
  'problematic_start_date',
  'problematic_end_date'
);
```

### 3. 재고 복구

```sql
-- 특정 기간 재고 수동 복구
UPDATE banner_slot_inventory
SET
  available_slots = total_slots - closed_slots,
  updated_at = NOW()
WHERE panel_info_id = 'target_panel_id'
  AND region_gu_display_period_id = 'target_period_id';
```

---

**이제 사용자가 특정 기간(상반기/하반기)에 신청하면 해당 기간의 재고만 정확하게 감소합니다!** 🎉
