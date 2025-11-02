# `restore_banner_slot_inventory_on_order_delete` 함수 변수 설명

## 변수 선언부 (DECLARE 섹션)

```sql
DECLARE
  period_id UUID;              -- 기간 ID를 저장할 변수
  banner_slot_id_val UUID;     -- 배너 슬롯 ID를 저장할 변수
```

이 변수들은 **함수 내부에서만 사용되는 로컬 변수**입니다.

---

## 각 변수가 어디서 값을 얻는지

### 1. `banner_slot_id_val` 변수

**값 설정 위치 1** (11-18줄):

```sql
IF OLD.panel_slot_usage_id IS NOT NULL THEN
  SELECT banner_slot_id INTO banner_slot_id_val
  FROM panel_slot_usage
  WHERE id = OLD.panel_slot_usage_id;
```

- **출처**: `panel_slot_usage` 테이블
- **조건**: 삭제되는 `order_details` 레코드에 `panel_slot_usage_id`가 있는 경우
- **의미**: 해당 `panel_slot_usage` 레코드의 `banner_slot_id`를 가져옴

**값 설정 위치 2** (19-28줄):

```sql
ELSE
  SELECT bs.id INTO banner_slot_id_val
  FROM banner_slots bs
  WHERE bs.panel_id = OLD.panel_id
    AND bs.slot_number = 1
  LIMIT 1;
```

- **출처**: `banner_slots` 테이블
- **조건**: `panel_slot_usage_id`가 없는 경우 (대체 로직)
- **의미**: 해당 패널의 1번 슬롯을 기본값으로 사용

---

### 2. `period_id` 변수

**값 설정 위치** (31-41줄):

```sql
SELECT rgdp.id INTO period_id
FROM region_gu_display_periods rgdp
JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
WHERE pi.id = OLD.panel_id
  AND rgdp.display_type_id = pi.display_type_id
  AND (
    (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
    OR
    (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
  );
```

- **출처**: `region_gu_display_periods` 테이블
- **조건**:
  - 삭제되는 `order_details`의 `panel_id`와 일치하는 패널
  - `display_type_id`가 일치
  - `display_start_date`와 `display_end_date`가 기간(`period_from`, `period_to`)과 겹침
- **의미**: 주문했던 기간에 해당하는 `region_gu_display_periods` 레코드의 ID

---

## 변수 사용 위치

### `banner_slot_id_val` 사용 (50줄):

```sql
WHERE banner_slot_id = banner_slot_id_val
  AND region_gu_display_period_id = period_id;
```

- `banner_slot_inventory` 테이블을 업데이트할 때 사용
- 어떤 배너 슬롯의 재고를 복구할지 지정

### `period_id` 사용 (44줄, 51줄):

```sql
IF period_id IS NOT NULL THEN
  ...
  AND region_gu_display_period_id = period_id;
```

- 어떤 기간의 재고를 복구할지 지정
- `period_id`가 NULL이면 기간을 찾지 못한 것이므로 재고 복구를 건너뜀

---

## 전체 흐름 요약

1. **`order_details` 레코드가 삭제됨** (트리거 발생)
2. **`OLD` 레코드**: 삭제되는 `order_details` 레코드 정보
3. **`banner_slot_id_val` 조회**:
   - `OLD.panel_slot_usage_id` → `panel_slot_usage.banner_slot_id`
   - 또는 `OLD.panel_id` → `banner_slots.id` (1번 슬롯)
4. **`period_id` 조회**:
   - `OLD.panel_id`, `OLD.display_start_date`, `OLD.display_end_date` → `region_gu_display_periods.id`
5. **재고 복구**:
   - `banner_slot_inventory` 테이블에서 해당 `banner_slot_id`와 `period_id`의 재고를 `is_available = true`, `is_closed = false`로 복구

---

## 왜 이런 변수가 필요한가?

- `order_details` 테이블에는 `banner_slot_id` 컬럼이 없음
- 삭제되는 레코드(`OLD`)에서 직접 `banner_slot_id`를 알 수 없음
- 따라서 `panel_slot_usage_id`를 통해 간접적으로 조회해야 함
- 마찬가지로 기간 정보도 `display_start_date`, `display_end_date`를 기반으로 조회해야 함
