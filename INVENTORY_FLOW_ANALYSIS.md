# 📊 재고 관리 흐름 분석

## 테이블 관계 구조

```
panels (패널)
  └─> banner_slots (배너 슬롯들 - 한 패널에 여러 슬롯 가능)
        └─> banner_slot_inventory (슬롯별 재고)

order_details (주문 상세)
  ├─ panel_id → panels.id
  └─ panel_slot_usage_id → panel_slot_usage.id

panel_slot_usage (슬롯 사용)
  ├─ panel_id → panels.id
  ├─ banner_slot_id → banner_slots.id ✅ (여기 있음!)
  └─ slot_number
```

## 현재 문제점

### ❌ `banner_slot_inventory` 테이블 스키마

```sql
CREATE TABLE banner_slot_inventory (
  banner_slot_id uuid NOT NULL,  -- 필수!
  region_gu_display_period_id uuid NOT NULL,
  ...
)
```

### ❌ 현재 `update_banner_slot_inventory_on_order` 함수

```sql
-- 문제 1: INSERT 시 banner_slot_id를 넣지 않음!
INSERT INTO banner_slot_inventory (
  panel_id,  -- ❌ banner_slot_inventory에는 panel_id 컬럼이 없음!
  region_gu_display_period_id,
  ...
)

-- 문제 2: UPDATE도 panel_id로만 조회
UPDATE banner_slot_inventory
WHERE panel_id = NEW.panel_id  -- ❌ banner_slot_inventory에는 panel_id 컬럼이 없음!
```

## 올바른 재고 관리 흐름

### ✅ 수정 방향

1. **`order_details` INSERT 시**:

   - `panel_slot_usage_id`를 통해 `banner_slot_id` 조회
   - `banner_slot_id` + `region_gu_display_period_id`로 재고 차감

2. **재고 차감 로직**:
   ```
   order_details.panel_slot_usage_id
     → panel_slot_usage.banner_slot_id
       → banner_slot_inventory 조회/업데이트
   ```

## 필요한 수정 사항

1. `update_banner_slot_inventory_on_order` 함수 수정:

   - `panel_slot_usage_id`를 통해 `banner_slot_id` 조회
   - `banner_slot_id` 기준으로 재고 관리

2. `banner_slot_inventory` 테이블 확인:
   - 실제 스키마에 `panel_id` 컬럼이 있는지 확인
   - 없으면 `banner_slot_id`만 사용해야 함
