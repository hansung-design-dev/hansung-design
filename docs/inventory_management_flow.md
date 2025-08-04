# 🎯 현수막게시대 & LED 전자게시대 재고 관리 플로우

## 📊 현재 데이터 현황

### 현수막게시대 (Banner Display)

- **총 게시대 수**: 5개 구 (관악구, 송파구, 서대문구, 용산구, 마포구)
- **총 면 수**: 3,198개 (banner_slot_inventory 테이블)
- **구별 면 분포**:
  - 관악구: ~13개 게시대 × 2면 = ~26개
  - 송파구: ~20개 게시대 × 2면 = ~40개
  - 서대문구: ~24개 게시대 × 2면 = ~48개
  - 용산구: ~19개 게시대 × 2면 = ~38개
  - 마포구: ~90개 게시대 × 2면 = ~180개
  - **총계**: ~332개 면 (3,198개는 다른 데이터일 가능성)

### LED 전자게시대 (LED Display)

- **총 게시대 수**: 5개 구
- **면당 슬롯 수**: 20개 (고정)
- **총 면 수**: 게시대 수 × 20개

---

## 🔄 재고 관리 플로우

### 1️⃣ 현수막게시대 재고 관리

#### 📋 데이터 구조

```
panels (게시대 정보)
├── banner_slots (각 게시대의 면 정보)
│   ├── slot_number (면 번호: 1, 2)
│   ├── banner_type (면 타입)
│   └── panel_slot_status (면 상태)
├── banner_slot_inventory (면별 재고 상태)
│   ├── is_available (사용 가능 여부)
│   └── is_closed (폐쇄 여부)
└── banner_slot_price_policy (면별 가격 정책)
```

#### 🔄 주문 플로우

1. **주문 접수** → `orders` 테이블 생성
2. **면 할당** → `panel_slot_usage` 테이블 생성
   - `banner_slot_id`로 특정 면 연결
   - 선착순: `available` 상태의 면 중 가장 낮은 `slot_number` 자동 할당
3. **재고 상태 업데이트** → `banner_slot_inventory.is_available = false`
4. **주문 완료** → `order_details`에 면 정보 저장

#### 📊 Admin에서 확인 가능한 정보

```sql
-- 구별 게시대별 면 현황
SELECT
  rg.name as district_name,
  p.panel_code,
  COUNT(bs.id) as total_faces,
  COUNT(CASE WHEN bsi.is_available = true THEN 1 END) as available_faces,
  COUNT(CASE WHEN bsi.is_available = false THEN 1 END) as occupied_faces
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN banner_slots bs ON p.id = bs.panel_id
LEFT JOIN banner_slot_inventory bsi ON bs.id = bsi.banner_slot_id
WHERE p.display_type_id = 'banner_display_id'
GROUP BY rg.name, p.panel_code;
```

---

### 2️⃣ LED 전자게시대 재고 관리

#### 📋 데이터 구조

```
panels (게시대 정보)
├── led_slots (각 게시대의 슬롯 정보)
│   ├── slot_number (슬롯 번호: 1-20)
│   └── panel_slot_status (슬롯 상태)
├── led_display_inventory (게시대별 재고 상태)
│   ├── total_faces (총 면 수: 20개 고정)
│   ├── available_faces (사용 가능 면 수)
│   └── closed_faces (폐쇄 면 수)
└── led_display_price_policy (게시대별 가격 정책)
```

#### 🔄 주문 플로우

1. **주문 접수** → `orders` 테이블 생성
2. **슬롯 할당** → `led_slots` 테이블 업데이트
   - `panel_slot_status = 'unavailable'`로 변경
   - 선착순: `available` 상태의 슬롯 중 가장 낮은 `slot_number` 자동 할당
3. **재고 상태 업데이트** → `led_display_inventory.available_faces` 감소
4. **주문 완료** → `order_details`에 슬롯 정보 저장

#### 📊 Admin에서 확인 가능한 정보

```sql
-- 구별 LED 게시대 재고 현황
SELECT
  rg.name as district_name,
  p.panel_code,
  ldi.total_faces,
  ldi.available_faces,
  ldi.closed_faces,
  (ldi.total_faces - ldi.available_faces - ldi.closed_faces) as occupied_faces
FROM panels p
JOIN region_gu rg ON p.region_gu_id = rg.id
JOIN led_display_inventory ldi ON p.id = ldi.panel_id
WHERE p.display_type_id = 'led_display_id';
```

---

## 🎯 Admin 대시보드 구성 제안

### 📊 현수막게시대 관리

1. **구별 게시대 현황**

   - 총 게시대 수
   - 총 면 수
   - 사용 가능한 면 수
   - 사용률 (%)

2. **게시대별 상세 현황**

   - 게시대 번호
   - 면별 상태 (1번 면, 2번 면)
   - 현재 주문 상태
   - 예상 완료일

3. **면별 주문 이력**
   - 주문 번호
   - 사용된 면 번호
   - 게시 기간
   - 주문 상태

### 📊 LED 전자게시대 관리

1. **구별 게시대 현황**

   - 총 게시대 수
   - 총 슬롯 수 (게시대 수 × 20)
   - 사용 가능한 슬롯 수
   - 사용률 (%)

2. **게시대별 상세 현황**

   - 게시대 번호
   - 슬롯별 상태 (1-20번 슬롯)
   - 현재 주문 상태
   - 예상 완료일

3. **슬롯별 주문 이력**
   - 주문 번호
   - 사용된 슬롯 번호
   - 게시 기간
   - 주문 상태

---

## 🔍 데이터 검증 필요사항

### 현수막게시대

- [ ] 3,198개 로우가 정확한지 확인
- [ ] 구별 게시대 수와 면 수 매칭
- [ ] `banner_slot_inventory`와 `banner_slots` 데이터 일치성

### LED 전자게시대

- [ ] 구별 게시대 수 확인
- [ ] `led_display_inventory` 데이터 생성
- [ ] `led_slots` 데이터 상태 확인

---

## 📈 향후 개선 방안

1. **실시간 재고 모니터링**

   - 대시보드에서 실시간 재고 현황 확인
   - 알림 기능 (재고 부족 시)

2. **예약 시스템**

   - 미래 날짜 예약 기능
   - 자동 면/슬롯 할당

3. **통계 및 분석**
   - 구별, 게시대별 사용률 통계
   - 수익 분석
   - 인기 게시대 분석
