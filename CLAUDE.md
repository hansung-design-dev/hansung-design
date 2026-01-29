# CLAUDE.md

## Language

- 모든 대화는 한국어로 진행합니다

## Project Structure

- Admin project: `../hansung-design-admin`

## Git Commit Guidelines

- Commit messages must be written in English
- Do not include Claude co-author in commits

---

## DB 스키마

### 핵심 테이블

**panels** - 게시대 정보
- `id` (uuid, PK)
- `display_type_id` (uuid, FK → display_types)
- `region_gu_id` (uuid, FK → region_gu)
- `region_dong_id` (uuid, FK → region_dong)
- `panel_code` (smallint) - 게시대 번호 (구별로 중복 가능)
- `nickname` (text) - 게시대 이름
- `panel_type` (enum) - `multi_panel`, `lower_panel`, `bulletin_board`, `cultural_board`, `panel`, `semi_auto`
- `panel_status` (enum) - `active`, `inactive` 등
- `max_banner` (integer) - 최대 현수막 수
- `latitude`, `longitude` (numeric)
- `photo_url`, `address`, `maintenance_notes`, `notes` (text)

**banner_slots** - 게시대의 개별 슬롯
- `id` (uuid, PK)
- `panel_id` (uuid, FK → panels)
- `slot_number` (integer) - 0: 중앙광고/상단광고, 1~N: 일반 현수막 슬롯
- `slot_name` (text)
- `banner_type` (text) - `panel`, `semi_auto` 등
- `price_unit` (text) - `15 days`, `1 year` 등
- `max_width`, `max_height` (numeric)
- `panel_slot_status` (text)

**banner_slot_inventory** - 슬롯별 기간별 재고
- `id` (uuid, PK)
- `banner_slot_id` (uuid, FK → banner_slots)
- `region_gu_display_period_id` (uuid, FK → region_gu_display_periods)
- `is_available` (boolean) - 예약 가능 여부
- `is_closed` (boolean) - 마감 여부
- UNIQUE(banner_slot_id, region_gu_display_period_id)

**region_gu_display_periods** - 구별 기간 정보
- `id` (uuid, PK)
- `region_gu_id` (uuid, FK → region_gu)
- `display_type_id` (uuid, FK → display_types)
- `year_month` (text) - 예: `2026-02`
- `period` (text) - `first_half`, `second_half`
- `period_from`, `period_to` (date)
- UNIQUE(display_type_id, region_gu_id, year_month, period)

**panel_slot_usage** - 슬롯 사용(예약) 정보
- `id` (uuid, PK)
- `panel_id` (uuid, FK → panels)
- `banner_slot_id` (uuid, FK → banner_slots)
- `slot_number` (integer)
- `display_type_id` (uuid)
- `usage_type` (text)
- `attach_date_from` (date)
- `banner_type` (text)
- `is_active` (boolean)
- `is_closed` (boolean)

**order_details** - 주문 상세
- `id` (uuid, PK)
- `order_id` (uuid, FK → orders)
- `panel_id` (uuid, FK → panels)
- `panel_slot_usage_id` (uuid, FK → panel_slot_usage)
- `display_start_date`, `display_end_date` (date)
- `price`, `tax_price`, `road_usage_fee`, `advertising_fee` (numeric)

**region_gu** - 구 정보
- `id` (uuid, PK)
- `name` (text) - 예: `마포구`
- `code` (text) - 예: `mapo`
- `display_type_id` (uuid)
- `is_active` (boolean)

**display_types** - 디스플레이 타입
- `id` (uuid, PK)
- `name` (enum) - `banner_display`, `led_display`

### 주요 뷰

**half_period_inventory_status** - 패널별 상/하반기 재고 집계
- `panel_id`, `district`, `year_month`, `half_period`, `slot_number`
- `total_slots`, `available_slots`, `closed_slots`
- slot_number별로 그룹화됨 (API에서 slot_number > 0 필터 후 합산)

---

## 비즈니스 로직

### 구별 기간 오픈 규칙

| 구 | 상반기 오픈일 | 하반기 오픈일 | 상반기 기간 | 하반기 기간 |
|---|---|---|---|---|
| 마포구, 강북구 | 5일 | 20일 | 5일~19일 | 20일~다음달 4일 |
| 나머지 구 | 1일 | 16일 | 1일~15일 | 16일~말일 |

### 7일 전 마감 로직
- 기간 시작일 7일 전부터 해당 기간 신청 불가
- `available_periods`에서 자동 제외됨

### 재고 로직
- **재고 레코드 없음 → 신청 불가** (slotResolver.ts에서 `return false`)
- `is_closed: true` → 마감
- `is_available: false` → 예약 불가
- UI에서 `inventory_info` 없으면 남은 수량 0으로 표시

### 마포구 패널 타입 필터
- **연립형(yeollip)**: `panel_type = 'multi_panel'`
- **저단형(jeodan)**: `panel_type = 'lower_panel'`
- **시민게시대(simin)**: `panel_type = 'bulletin_board'` 또는 `'cultural_board'`

### 슬롯 번호 규칙
- `slot_number = 0`: 중앙광고/상단광고 (재고 계산에서 제외)
- `slot_number > 0`: 일반 현수막 슬롯

### 크론잡 스케줄
- `/api/schedule-period-generation`
- 스케줄: `0 0 1,5,16,20 * *` (UTC 0시 = KST 9시)
- 1일: 일반 구 상반기 기간 생성
- 5일: 마포구/강북구 상반기 기간 생성
- 16일: 일반 구 하반기 기간 생성
- 20일: 마포구/강북구 하반기 기간 생성

### DB 트리거
- `trigger_auto_inventory`: `region_gu_display_periods` INSERT 시 자동으로 `banner_slot_inventory` 생성
