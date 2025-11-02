# 🔧 트리거 함수 수정 가이드

## 문제 상황

- `record "new" has no field "banner_slot_id"` 에러 발생
- `exec_sql` RPC 함수가 없어 API로 실행 불가

## 테이블 관계 분석

### 주요 테이블 구조

```
orders (주문)
  └─> order_details (주문 상세)
        ├─ panel_id
        └─ panel_slot_usage_id → panel_slot_usage.id

panel_slot_usage (슬롯 사용)
  ├─ banner_slot_id ✅ (여기 있음!)
  ├─ panel_id
  └─ slot_number
```

### 트리거 위치

- `trigger_update_top_fixed_banner_inventory` → `panel_slot_usage` 테이블 AFTER INSERT
- 이 트리거에서 `NEW.banner_slot_id`를 참조하므로 **정상적으로 작동해야 함**

## 해결 방법

### 1단계: Supabase SQL Editor에서 트리거 확인

다음 SQL을 실행하여 현재 트리거 상태를 확인하세요:

```sql
-- 현재 트리거 확인
SELECT
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%top_fixed%' OR trigger_name LIKE '%panel_slot%'
ORDER BY event_object_table, trigger_name;
```

### 2단계: 함수가 제대로 생성되었는지 확인

```sql
-- 함수 정의 확인
SELECT
    proname as function_name,
    prosrc as function_body
FROM pg_proc
WHERE proname IN (
    'update_top_fixed_banner_inventory',
    'fill_panel_slot_snapshot_after_order_details',
    'update_banner_slot_inventory_on_order',
    'update_updated_at_column'
);
```

### 3단계: 수정된 함수 재생성

`fix_functions_for_supabase.sql` 파일의 모든 함수를 **Supabase SQL Editor에서 하나씩 실행**하세요.

**⚠️ 중요:** 각 함수를 개별적으로 실행하고, 각각 "Success" 메시지가 나오는지 확인하세요.

### 4단계: 트리거 재생성 (필요시)

함수 재생성 후에도 문제가 있으면 트리거를 재생성하세요:

```sql
-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_update_top_fixed_banner_inventory ON panel_slot_usage;

-- 트리거 재생성
CREATE TRIGGER trigger_update_top_fixed_banner_inventory
  AFTER INSERT ON panel_slot_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_top_fixed_banner_inventory();
```

## 디버깅 체크리스트

1. ✅ `update_top_fixed_banner_inventory()` 함수가 `CREATE OR REPLACE FUNCTION`으로 제대로 생성되었는가?
2. ✅ 함수 정의에 `RETURNS TRIGGER AS $top_fixed_inventory$` 구문이 있는가?
3. ✅ 함수 끝에 `$top_fixed_inventory$ LANGUAGE plpgsql;`가 있는가?
4. ✅ 트리거가 `panel_slot_usage` 테이블에 올바르게 걸려있는가?
5. ✅ `panel_slot_usage` 테이블에 INSERT할 때 `banner_slot_id`가 포함되어 있는가?

## 예상 원인

만약 여전히 에러가 발생한다면:

1. **함수가 제대로 생성되지 않았을 수 있음**

   - Supabase SQL Editor에서 다시 실행
   - 각 함수마다 개별 실행 (한 번에 여러 개 실행하지 말 것)

2. **트리거가 잘못된 테이블에 걸려있을 수 있음**

   - 위의 확인 SQL로 트리거 위치 확인

3. **캐시 문제일 수 있음**
   - Supabase 대시보드에서 "Refresh" 클릭
   - 또는 잠시 기다렸다가 다시 시도

## 최종 확인

주문을 다시 시도하기 전에 다음을 확인하세요:

```sql
-- 함수 존재 확인
SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_top_fixed_banner_inventory'
) as function_exists;

-- 트리거 존재 확인
SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_update_top_fixed_banner_inventory'
    AND event_object_table = 'panel_slot_usage'
) as trigger_exists;
```

둘 다 `true`가 나와야 합니다!
