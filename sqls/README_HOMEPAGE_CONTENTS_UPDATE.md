# 홈페이지 컨텐츠 스키마 업데이트

## 변경사항

### 1. 새로운 Enum 타입 추가

- `homepage_menu_enum`: 페이지 구분용 ('main', 'banner_display', 'led_display', 'public_design', 'digital_signage')

### 2. homepage_contents 테이블 수정

- `page` 컬럼 추가: `homepage_menu_enum` 타입
- `homepage_menu_types` 컬럼을 `sections`로 이름 변경 (테이블 참조 유지)
- 기존 foreign key 제약조건 유지

### 3. homepage_menu_types 테이블 수정

- `section_type` 컬럼 추가: 섹션 구분용 텍스트
- 기본 데이터 추가: 각 섹션별 메뉴 타입

### 4. 성능 최적화

- `page` 컬럼에 인덱스 추가
- `sections` 컬럼에 인덱스 추가

### 5. 데이터 구조

#### 랜딩페이지 섹션 (page='main')

- `main`: 메인 섹션
- `banner_display_part`: 배너 디스플레이 섹션
- `led_display_part`: LED 디스플레이 섹션
- `public_design_part`: 공공디자인 섹션
- `digital_signage_part`: 디지털 사이니지 섹션

#### 각 페이지 메인 (page='각*페이지*타입')

- `led_display_main`: LED 디스플레이 페이지 메인
- `banner_display_main`: 배너 디스플레이 페이지 메인
- `digital_signage_main`: 디지털 사이니지 페이지 메인
- `public_design_main`: 공공디자인 페이지 메인

## 실행 방법

```sql
-- 1. 스키마 업데이트
\i update_homepage_contents_schema.sql

-- 2. 각 페이지 메인 컨텐츠 추가
\i insert_page_main_contents.sql
```

## API 변경사항

### 기존 API

```typescript
GET / api / homepage - contents;
```

### 새로운 API (필터링 지원)

```typescript
// 랜딩페이지 섹션 가져오기
GET /api/homepage-contents?page=main&section=led_display_part

// 각 페이지 메인 가져오기
GET /api/homepage-contents?page=led_display&section=led_display_main
```

## 프론트엔드 변경사항

### 랜딩페이지

- 각 섹션별로 DB에서 이미지와 컨텐츠를 가져오도록 수정
- fallback 이미지 제공

### 각 페이지 (LED, 배너, 디지털사이니지, 공공디자인)

- 페이지 메인 이미지와 컨텐츠를 DB에서 동적으로 가져오도록 수정
- fallback 이미지 제공
- 타입 안전성 향상

## 사용 예시

```typescript
// 랜딩페이지 LED 섹션 컨텐츠 가져오기
const response = await fetch(
  '/api/homepage-contents?page=main&section=led_display_part'
);
const data = await response.json();

// LED 디스플레이 페이지 메인 컨텐츠 가져오기
const response = await fetch(
  '/api/homepage-contents?page=led_display&section=led_display_main'
);
const data = await response.json();

// 디지털 사이니지 페이지 메인 컨텐츠 가져오기
const response = await fetch(
  '/api/homepage-contents?page=digital_signage&section=digital_signage_main'
);
const data = await response.json();
```

## 데이터베이스 구조

### homepage_contents 테이블

- `page`: 페이지 구분 (enum)
- `sections`: homepage_menu_types 테이블 참조 (foreign key)
- 기타 컨텐츠 필드들

### homepage_menu_types 테이블

- `name`: 메뉴 이름
- `description`: 메뉴 설명
- `section_type`: 섹션 구분

#### 랜딩페이지 섹션 타입

- `main`: 메인 섹션
- `banner_display_part`: 배너 디스플레이 섹션
- `led_display_part`: LED 디스플레이 섹션
- `public_design_part`: 공공디자인 섹션
- `digital_signage_part`: 디지털 사이니지 섹션

#### 페이지 메인 섹션 타입

- `led_display_main`: LED 디스플레이 페이지 메인
- `banner_display_main`: 배너 디스플레이 페이지 메인
- `digital_signage_main`: 디지털 사이니지 페이지 메인
- `public_design_main`: 공공디자인 페이지 메인

## 주의사항

1. 기존 데이터가 있는 경우 마이그레이션이 필요할 수 있습니다.
2. homepage_menu_types 테이블은 계속 사용됩니다.
3. 새로운 page enum 타입은 타입 안전성을 보장합니다.
4. sections 컬럼은 homepage_menu_types 테이블의 id를 참조합니다.
5. 랜딩페이지 섹션과 각 페이지 메인을 구분하여 관리합니다.
