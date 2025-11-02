# 최종 해결 가이드: `record "new" has no field "banner_slot_id"` 에러

## 문제 확인

에러가 계속 발생한다면 다음을 확인하세요:

1. **모든 함수가 제대로 수정되었는지**
2. **`update_slot_inventory_on_order` 함수가 문제인지**
3. **Supabase에 함수가 실제로 적용되었는지**

## 해결 단계

### 1단계: Supabase에서 현재 상태 확인

`sqls/CHECK_AND_FIX_ALL_TRIGGERS.sql` 파일을 Supabase SQL Editor에서 실행하세요.

이 쿼리는 다음을 확인합니다:

- `order_details`에 연결된 모든 트리거
- 모든 함수에서 `NEW.banner_slot_id` 직접 참조 여부
- `update_slot_inventory_on_order` 함수 존재 및 상태

### 2단계 A: `update_slot_inventory_on_order` 함수가 문제인 경우

만약 `update_slot_inventory_on_order` 함수가 `NEW.banner_slot_id`를 참조한다면:

**옵션 1**: 트리거 임시 비활성화 (권장)

```sql
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;
```

이 트리거는 `banner_inventory_insert_trigger`와 중복 기능일 수 있으므로 비활성화해도 될 수 있습니다.

**옵션 2**: 함수 수정 (나중에 필요하면)
`update_banner_slot_inventory_on_order` 함수와 동일한 방식으로 수정해야 합니다.

### 2단계 B: 함수가 제대로 적용되지 않은 경우

각 함수 파일을 **다시 하나씩** 실행:

1. `sqls/1_update_banner_slot_inventory_on_order.sql` 실행
2. `sqls/2_check_inventory_before_order.sql` 실행
3. `sqls/3_restore_banner_slot_inventory_on_order_delete.sql` 실행

각 함수 실행 후:

```sql
SELECT proname, prosrc LIKE '%NEW.banner_slot_id%' as has_error
FROM pg_proc
WHERE proname = '함수이름';
```

실행하여 `has_error`가 `false`인지 확인하세요.

### 3단계: 트리거 확인

```sql
SELECT
  trigger_name,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY action_timing, trigger_name;
```

**중요**: 다음 트리거들이 실행됩니다:

- `inventory_check_trigger` (BEFORE INSERT) → `check_inventory_before_order()`
- `banner_inventory_insert_trigger` (AFTER INSERT) → `update_banner_slot_inventory_on_order()`
- `slot_inventory_insert_trigger` (AFTER INSERT) → `update_slot_inventory_on_order()` ← **이것이 문제일 수 있음**

### 4단계: 테스트

모든 수정 후 주문을 다시 시도하세요.

## 빠른 해결 (임시)

만약 급하다면:

```sql
-- 문제가 되는 트리거 비활성화
ALTER TABLE order_details DISABLE TRIGGER slot_inventory_insert_trigger;
```

이렇게 하면 `banner_inventory_insert_trigger`만 실행되므로 에러가 해결될 수 있습니다.
