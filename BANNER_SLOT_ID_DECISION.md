# `order_details`에 `banner_slot_id` 추가 여부 결정 가이드

## 현재 구조

```
order_details
├── panel_id (패널 정보)
└── panel_slot_usage_id → panel_slot_usage
                         ├── banner_slot_id → banner_slots
                         │                   └── slot_number (1, 2, 3...)
                         └── slot_number

banner_slot_inventory
├── banner_slot_id (재고 관리 기준)
└── region_gu_display_period_id
```

## 사용자의 요구사항

1. **패널 주문 시 슬롯을 1번부터 순서대로 채워넣어야 함**
2. **몇 번 슬롯까지 채워졌는지 추적 필요**
3. **재고 관리도 이 기반으로 해야 함**

---

## 옵션 1: 현재 구조 유지 (정규화 준수) ✅ **추천**

### 장점

1. **데이터 정규화**: 중복 없음, 데이터 일관성 유지
2. **단일 정보 소스**: `panel_slot_usage`가 슬롯 할당의 유일한 출처
3. **트리거 단순화**: `panel_slot_usage_id`만 있으면 모든 정보 조회 가능
4. **슬롯 변경 시 일관성**: `panel_slot_usage` 수정만으로 모든 참조 자동 반영

### 단점

1. **JOIN 필요**: 슬롯 정보 조회 시 JOIN이 필요 (성능 영향 적음)
2. **쿼리 복잡도**: 약간 더 복잡한 쿼리

### 슬롯 채움 현황 추적 쿼리

```sql
-- 특정 패널의 슬롯 채움 현황 확인
SELECT
  p.id as panel_id,
  p.panel_code,
  bs.slot_number,
  bs.id as banner_slot_id,
  CASE
    WHEN psu.id IS NOT NULL THEN '사용 중'
    ELSE '사용 가능'
  END as status,
  od.id as order_detail_id,
  od.order_id
FROM panels p
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
  AND psu.is_active = true
  AND psu.is_closed = false
LEFT JOIN order_details od ON psu.id = od.panel_slot_usage_id
WHERE p.id = '패널-ID'
ORDER BY bs.slot_number;

-- 몇 번 슬롯까지 채워졌는지 확인
SELECT
  p.id as panel_id,
  MAX(bs.slot_number) as max_filled_slot,
  COUNT(DISTINCT bs.id) as total_slots,
  COUNT(DISTINCT CASE WHEN psu.id IS NOT NULL THEN bs.id END) as filled_slots
FROM panels p
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
  AND psu.is_active = true
  AND psu.is_closed = false
WHERE p.id = '패널-ID'
GROUP BY p.id;
```

### 재고 관리 (현재 구조로 가능)

```sql
-- 특정 패널의 슬롯별 재고 확인
SELECT
  p.id as panel_id,
  bs.slot_number,
  bs.id as banner_slot_id,
  rgdp.period_from,
  rgdp.period_to,
  bsi.is_available,
  bsi.is_closed
FROM panels p
JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
WHERE p.id = '패널-ID'
ORDER BY bs.slot_number, rgdp.period_from;
```

---

## 옵션 2: `order_details`에 `banner_slot_id` 추가 (정규화 위반)

### 장점

1. **직접 접근**: JOIN 없이 바로 `banner_slot_id` 접근 가능
2. **쿼리 단순화**: 간단한 쿼리로 슬롯 정보 확인
3. **성능 향상**: JOIN 줄임 (미미한 차이)

### 단점

1. **데이터 중복**: `panel_slot_usage.banner_slot_id`와 중복
2. **일관성 위험**: `order_details.banner_slot_id`와 `panel_slot_usage.banner_slot_id` 불일치 가능
3. **유지보수 복잡**: 두 곳에서 같은 정보 관리 필요
4. **트리거 복잡화**: 두 컬럼 모두 확인해야 함
5. **정규화 원칙 위반**: 3NF 위반

### 슬롯 채움 현황 추적 쿼리 (간단함)

```sql
-- 특정 패널의 슬롯 채움 현황 확인
SELECT
  od.panel_id,
  bs.slot_number,
  od.banner_slot_id,
  COUNT(od.id) as order_count
FROM order_details od
JOIN banner_slots bs ON od.banner_slot_id = bs.id
WHERE od.panel_id = '패널-ID'
GROUP BY od.panel_id, bs.slot_number, od.banner_slot_id
ORDER BY bs.slot_number;

-- 몇 번 슬롯까지 채워졌는지 확인 (매우 간단!)
SELECT
  od.panel_id,
  MAX(bs.slot_number) as max_filled_slot
FROM order_details od
JOIN banner_slots bs ON od.banner_slot_id = bs.id
WHERE od.panel_id = '패널-ID'
GROUP BY od.panel_id;
```

### 재고 관리 (더 간단함)

```sql
-- 특정 패널의 슬롯별 재고 확인
SELECT
  od.panel_id,
  od.banner_slot_id,
  bs.slot_number,
  rgdp.period_from,
  rgdp.period_to,
  bsi.is_available,
  bsi.is_closed
FROM order_details od
JOIN banner_slots bs ON od.banner_slot_id = bs.id
LEFT JOIN banner_slot_inventory bsi ON od.banner_slot_id = bsi.banner_slot_id
LEFT JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
WHERE od.panel_id = '패널-ID'
ORDER BY bs.slot_number, rgdp.period_from;
```

---

## 성능 비교

### 옵션 1 (현재 구조)

```sql
-- 슬롯 채움 현황: 1번 JOIN
SELECT od.*, psu.banner_slot_id, bs.slot_number
FROM order_details od
JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
JOIN banner_slots bs ON psu.banner_slot_id = bs.id;
```

### 옵션 2 (`banner_slot_id` 추가)

```sql
-- 슬롯 채움 현황: JOIN 줄어듦 (하지만 데이터 중복 발생)
SELECT od.*, bs.slot_number
FROM order_details od
JOIN banner_slots bs ON od.banner_slot_id = bs.id;
```

**성능 차이**: 거의 없음 (JOIN 한 번 차이, 인덱스로 충분히 최적화 가능)

---

## 데이터 일관성 시나리오

### 시나리오: `panel_slot_usage`의 `banner_slot_id`가 변경됨

**옵션 1 (현재 구조)**

- ✅ `order_details`는 `panel_slot_usage_id`만 참조하므로 자동으로 올바른 `banner_slot_id` 반영
- ✅ 데이터 일관성 유지

**옵션 2 (`banner_slot_id` 추가)**

- ❌ `order_details.banner_slot_id`가 이전 값을 가질 수 있음
- ❌ 데이터 불일치 발생 가능
- ❌ 트리거나 애플리케이션 로직으로 동기화 필요 (복잡도 증가)

---

## 실제 사용 케이스 분석

### 1. "몇 번 슬롯까지 채워졌는지" 확인

**옵션 1:**

```sql
SELECT MAX(bs.slot_number) as max_filled_slot
FROM order_details od
JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
JOIN banner_slots bs ON psu.banner_slot_id = bs.id
WHERE od.panel_id = '패널-ID';
```

→ **성능**: 인덱스가 있으면 충분히 빠름

**옵션 2:**

```sql
SELECT MAX(bs.slot_number) as max_filled_slot
FROM order_details od
JOIN banner_slots bs ON od.banner_slot_id = bs.id
WHERE od.panel_id = '패널-ID';
```

→ **약간 더 간단하지만 성능 차이는 미미**

### 2. 재고 관리

**옵션 1:**

```sql
-- 트리거에서 panel_slot_usage_id로 banner_slot_id 조회
SELECT banner_slot_id FROM panel_slot_usage WHERE id = NEW.panel_slot_usage_id;
```

→ **현재 구조로 충분히 가능** (이미 구현됨)

**옵션 2:**

```sql
-- 직접 접근
-- NEW.banner_slot_id (하지만 이게 panel_slot_usage와 일치하는지 보장 필요)
```

→ **더 간단하지만 일관성 검증 필요**

---

## 추천: **옵션 1 (현재 구조 유지)** ✅

### 이유

1. **정규화 원칙 준수**: 데이터 중복 없음, 일관성 보장
2. **현재 구조로도 충분**: 슬롯 추적, 재고 관리 모두 가능
3. **유지보수 용이**: 단일 정보 소스 (`panel_slot_usage`)
4. **성능 차이 미미**: 인덱스로 최적화 가능
5. **확장성**: 향후 `panel_slot_usage`에 추가 정보가 있어도 자연스럽게 반영

### 개선 사항

1. **인덱스 추가** (이미 있을 수 있음):

```sql
CREATE INDEX IF NOT EXISTS idx_order_details_panel_slot_usage_id
ON order_details(panel_slot_usage_id);

CREATE INDEX IF NOT EXISTS idx_panel_slot_usage_banner_slot_id
ON panel_slot_usage(banner_slot_id);

CREATE INDEX IF NOT EXISTS idx_banner_slots_panel_id_slot_number
ON banner_slots(panel_id, slot_number);
```

2. **뷰 생성** (자주 사용하는 쿼리 단순화):

```sql
CREATE OR REPLACE VIEW order_details_with_slots AS
SELECT
  od.*,
  psu.banner_slot_id,
  bs.slot_number,
  bs.banner_type
FROM order_details od
LEFT JOIN panel_slot_usage psu ON od.panel_slot_usage_id = psu.id
LEFT JOIN banner_slots bs ON psu.banner_slot_id = bs.id;
```

3. **함수 생성** (슬롯 채움 현황 확인):

```sql
CREATE OR REPLACE FUNCTION get_panel_slot_filling_status(p_panel_id UUID)
RETURNS TABLE(
  slot_number NUMERIC,
  banner_slot_id UUID,
  is_filled BOOLEAN,
  order_detail_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.slot_number,
    bs.id as banner_slot_id,
    (psu.id IS NOT NULL) as is_filled,
    od.id as order_detail_id
  FROM banner_slots bs
  LEFT JOIN panel_slot_usage psu ON bs.id = psu.banner_slot_id
    AND psu.is_active = true
    AND psu.is_closed = false
  LEFT JOIN order_details od ON psu.id = od.panel_slot_usage_id
  WHERE bs.panel_id = p_panel_id
  ORDER BY bs.slot_number;
END;
$$ LANGUAGE plpgsql;
```

---

## 최종 결론

**현재 구조(`panel_slot_usage_id`만 사용)로 충분합니다.**

- ✅ 슬롯 채움 현황 추적 가능
- ✅ 재고 관리 가능
- ✅ 데이터 일관성 보장
- ✅ 성능 문제 없음 (인덱스 활용)
- ✅ 유지보수 용이

`banner_slot_id`를 추가하는 것은:

- ❌ 데이터 중복 발생
- ❌ 일관성 문제 가능
- ❌ 이점이 미미함 (성능 차이 거의 없음)

**추가 작업이 필요하다면:**

1. 인덱스 추가
2. 뷰 생성 (쿼리 단순화)
3. 헬퍼 함수 생성 (슬롯 현황 조회)

이것으로도 충분히 빠르고 편리한 쿼리가 가능합니다.
