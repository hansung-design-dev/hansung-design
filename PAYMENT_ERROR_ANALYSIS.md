# 결제 위젯 이후 에러 분석

## 에러 발생 흐름

1. **사용자가 "결제하기" 버튼 클릭**
2. **주문 생성 API 호출** (`/api/orders` POST)
   - `orders` 테이블에 주문 레코드 생성 ✅
   - `order_details` 테이블에 주문 상세 레코드 생성 ❌ **여기서 에러 발생**
3. **트리거 실행**: `order_details` INSERT 시 여러 트리거가 실행됨
4. **에러 메시지**: `record "new" has no field "banner_slot_id"`

## 문제 원인

`order_details` 테이블에 INSERT할 때 실행되는 트리거 함수 중 하나가 `NEW.banner_slot_id`를 직접 참조하려고 시도합니다. 하지만 `order_details` 테이블에는 `banner_slot_id` 컬럼이 없습니다!

### order_details 테이블 구조

```sql
CREATE TABLE order_details (
  id UUID,
  order_id UUID,
  panel_id UUID,                    ✅ 있음
  panel_slot_usage_id UUID,         ✅ 있음
  slot_order_quantity INTEGER,
  display_start_date DATE,
  display_end_date DATE,
  -- banner_slot_id는 없음! ❌
);
```

### 실행되는 트리거들 (order_details에 연결된 트리거)

1. `banner_inventory_insert_trigger` → `update_banner_slot_inventory_on_order()` ✅ (수정됨)
2. `slot_inventory_insert_trigger` → `update_slot_inventory_on_order()` ❓ (확인 필요)
3. `inventory_check_trigger` → `check_inventory_before_order()` ✅ (수정됨)
4. `trigger_fill_panel_slot_snapshot_after_order_details` → `fill_panel_slot_snapshot_after_order_details()` ✅ (정상)

## 해결 방법

### 1단계: Supabase에서 현재 적용된 함수 확인

Supabase SQL Editor에서 다음 쿼리를 실행하여 실제 적용된 함수 코드를 확인하세요:

```sql
-- order_details에 연결된 모든 트리거 확인
SELECT
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'order_details'
ORDER BY action_timing, trigger_name;

-- 각 함수의 실제 코드 확인
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_banner_slot_inventory_on_order';

SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_slot_inventory_on_order';

SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'check_inventory_before_order';
```

### 2단계: 함수 재생성

`fix_functions_for_supabase.sql` 파일의 다음 함수들을 **순서대로** 실행하세요:

#### 함수 1: `update_banner_slot_inventory_on_order`

```sql
CREATE OR REPLACE FUNCTION update_banner_slot_inventory_on_order()
RETURNS TRIGGER AS $update_inventory$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
  current_inventory RECORD;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회 (NEW.banner_slot_id 직접 참조하지 않음!)
  IF NEW.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = NEW.panel_slot_usage_id;

    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_slot_usage_id %에 해당하는 banner_slot_id를 찾을 수 없음', NEW.panel_slot_usage_id;
      RETURN NEW;
    END IF;
  ELSE
    -- panel_slot_usage_id가 없으면 panel_id로 기본 슬롯 찾기
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = NEW.panel_id
      AND bs.slot_number = 1
    LIMIT 1;

    IF banner_slot_id_val IS NULL THEN
      RAISE NOTICE 'panel_id %에 해당하는 banner_slot을 찾을 수 없음', NEW.panel_id;
      RETURN NEW;
    END IF;
  END IF;

  -- 2. order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );

  -- 3. 해당 기간의 재고 업데이트 (banner_slot_id 기준)
  IF period_id IS NOT NULL THEN
    -- 기존 재고 조회
    SELECT * INTO current_inventory
    FROM banner_slot_inventory
    WHERE banner_slot_id = banner_slot_id_val
      AND region_gu_display_period_id = period_id;

    IF FOUND THEN
      -- 재고 업데이트: 주문되면 닫힘
      UPDATE banner_slot_inventory
      SET
        is_available = false,
        is_closed = true,
        updated_at = NOW()
      WHERE banner_slot_id = banner_slot_id_val
        AND region_gu_display_period_id = period_id;
    ELSE
      -- 재고 정보가 없으면 새로 생성 (주문되면 닫힘 상태로)
      INSERT INTO banner_slot_inventory (
        banner_slot_id,
        region_gu_display_period_id,
        is_available,
        is_closed
      )
      VALUES (
        banner_slot_id_val,
        period_id,
        false,
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$update_inventory$ LANGUAGE plpgsql;
```

#### 함수 2: `check_inventory_before_order`

```sql
CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $check_inventory$
DECLARE
  period_id UUID;
  banner_slot_id_val UUID;
  current_inventory RECORD;
BEGIN
  -- 1. panel_slot_usage_id를 통해 banner_slot_id 조회
  IF NEW.panel_slot_usage_id IS NOT NULL THEN
    SELECT banner_slot_id INTO banner_slot_id_val
    FROM panel_slot_usage
    WHERE id = NEW.panel_slot_usage_id;

    IF banner_slot_id_val IS NULL THEN
      RETURN NEW;
    END IF;
  ELSE
    SELECT bs.id INTO banner_slot_id_val
    FROM banner_slots bs
    WHERE bs.panel_id = NEW.panel_id
      AND bs.slot_number = 1
    LIMIT 1;

    IF banner_slot_id_val IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- 2. 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panels pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );

  -- 3. 재고 확인 (banner_slot_id 기준)
  IF period_id IS NOT NULL THEN
    SELECT * INTO current_inventory
    FROM banner_slot_inventory
    WHERE banner_slot_id = banner_slot_id_val
      AND region_gu_display_period_id = period_id;

    -- 재고가 이미 닫혀있으면 에러
    IF FOUND AND current_inventory.is_closed = true THEN
      RAISE EXCEPTION '재고 부족: 해당 슬롯이 이미 닫혀있습니다 (슬롯 ID: %, 기간: %)',
        banner_slot_id_val, period_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$check_inventory$ LANGUAGE plpgsql;
```

### 3단계: `update_slot_inventory_on_order` 함수 확인

만약 이 함수가 존재한다면, 이것도 확인해야 합니다. 이 함수가 `NEW.banner_slot_id`를 참조하는지 확인하세요.

```sql
-- 함수가 존재하는지 확인
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_slot_inventory_on_order';

-- 만약 존재한다면 전체 정의 확인
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_slot_inventory_on_order';
```

만약 이 함수가 `NEW.banner_slot_id`를 참조한다면, 같은 방식으로 수정해야 합니다.

## 핵심 포인트

1. **`order_details` 테이블에는 `banner_slot_id` 컬럼이 없습니다**
2. **`banner_slot_id`는 `panel_slot_usage` 테이블에서 조회해야 합니다**
3. **모든 트리거 함수는 `NEW.panel_slot_usage_id`를 통해 간접적으로 `banner_slot_id`를 얻어야 합니다**

## 검증 방법

함수를 수정한 후 다음을 실행하여 에러가 해결되었는지 확인하세요:

1. Supabase SQL Editor에서 간단한 `order_details` INSERT 테스트:

```sql
-- 테스트용 (실제 데이터로 변경 필요)
INSERT INTO order_details (
  order_id,
  panel_id,
  panel_slot_usage_id,
  slot_order_quantity,
  display_start_date,
  display_end_date
) VALUES (
  '테스트-주문-ID',
  '테스트-패널-ID',
  '테스트-슬롯-사용-ID',
  1,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '15 days'
);
```

2. 만약 에러가 발생하면, 에러 메시지를 확인하여 어떤 함수에서 문제가 발생하는지 파악하세요.

3. 로그 확인: Supabase Dashboard > Database > Logs에서 트리거 실행 로그를 확인할 수 있습니다.
