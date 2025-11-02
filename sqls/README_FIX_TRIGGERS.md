# 트리거 함수 수정 가이드

## 문제

`order_details` INSERT 시 `record "new" has no field "banner_slot_id"` 에러 발생

## 해결 방법

Supabase SQL Editor에서 **각 함수를 개별적으로 순서대로** 실행하세요.

### 실행 순서

1. **1_update_banner_slot_inventory_on_order.sql**

   - 파일 내용을 복사
   - Supabase SQL Editor에서 실행

2. **2_check_inventory_before_order.sql**

   - 파일 내용을 복사
   - Supabase SQL Editor에서 실행

3. **3_restore_banner_slot_inventory_on_order_delete.sql**
   - 파일 내용을 복사
   - Supabase SQL Editor에서 실행

### ⚠️ 중요 사항

- **한 번에 하나씩만 실행하세요**
- 여러 함수를 한 번에 실행하면 Supabase가 `$$` 구문을 제대로 파싱하지 못할 수 있습니다
- 각 함수 실행 후 "Success. No rows returned" 메시지가 나오면 성공입니다

### 검증

모든 함수 실행 후, 다음 쿼리로 확인:

```sql
SELECT
  proname as function_name,
  CASE
    WHEN prosrc LIKE '%NEW.banner_slot_id%' OR prosrc LIKE '%OLD.banner_slot_id%' THEN '❌ 아직 banner_slot_id 직접 참조 있음!'
    WHEN prosrc LIKE '%panel_slot_usage_id%' THEN '✅ 올바르게 수정됨'
    ELSE '⚠️ 확인 필요'
  END as status
FROM pg_proc
WHERE proname IN (
  'update_banner_slot_inventory_on_order',
  'check_inventory_before_order',
  'restore_banner_slot_inventory_on_order_delete'
);
```

모든 함수가 "✅ 올바르게 수정됨"으로 표시되면 성공입니다.
