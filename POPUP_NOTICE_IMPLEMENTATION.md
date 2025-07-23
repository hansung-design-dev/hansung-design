# 공지사항 팝업 시스템 구현

## 개요

게시대별 공지사항 팝업 시스템을 구현했습니다. 각 게시대 페이지에서 해당 게시대에 맞는 팝업 공지사항을 표시할 수 있습니다.

## 구현된 기능

### 1. 데이터베이스 스키마 수정

- `homepage_notice` 테이블에 팝업 관련 컬럼 추가:
  - `display_type`: 게시대 타입 (banner_display, led_display, digital_signage, public_design)
  - `is_popup`: 팝업 여부 (boolean)
  - `popup_start_date`: 팝업 시작일
  - `popup_end_date`: 팝업 종료일
  - `popup_width`: 팝업 너비
  - `popup_height`: 팝업 높이

### 2. API 엔드포인트 수정

- `/api/notices/route.ts` 수정:
  - `display_type` 파라미터 추가
  - `is_popup` 파라미터 추가
  - 팝업 공지사항 필터링 로직 구현
  - 날짜 기반 팝업 표시 조건 추가

### 3. 프론트엔드 컴포넌트

- `NoticePopup.tsx`: 팝업 컴포넌트

  - 팝업 표시/숨김 애니메이션
  - "오늘 하루 보지 않기" 기능
  - "다시 보지 않기" 기능
  - 팝업 크기 조절
  - 반응형 디자인

- `useNoticePopup.tsx`: 팝업 관리 훅
  - 게시대별 팝업 공지사항 조회
  - 팝업 상태 관리

### 4. 게시대별 팝업 적용

- `banner-display/page.tsx`: 현수막게시대
- `led-display/page.tsx`: LED 전자게시대
- `digital-signage/page.tsx`: 디지털사이니지
- `public-design/page.tsx`: 공공디자인

## 사용 방법

### 1. 데이터베이스 스키마 적용

```sql
-- sqls/add_popup_notice_fields.sql 실행
```

### 2. 목데이터 삽입

```sql
-- sqls/insert_popup_notice_sample_data.sql 실행
```

### 3. 팝업 공지사항 생성

API를 통해 팝업 공지사항을 생성할 수 있습니다:

```javascript
// 팝업 공지사항 생성 예시
const response = await fetch('/api/notices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '팝업 공지사항 제목',
    content: '팝업 공지사항 내용',
    display_type: 'banner_display',
    is_popup: true,
    popup_start_date: '2024-12-01',
    popup_end_date: '2024-12-31',
    popup_width: 500,
    popup_height: 400,
    priority: 'important',
  }),
});
```

### 4. 팝업 공지사항 조회

```javascript
// 특정 게시대의 팝업 공지사항 조회
const response = await fetch(
  '/api/notices?display_type=banner_display&is_popup=true'
);
```

## 팝업 기능

### 1. 표시 조건

- 현재 날짜가 `popup_start_date`와 `popup_end_date` 사이에 있을 때
- 해당 게시대 페이지에 접속했을 때
- 사용자가 이전에 "다시 보지 않기"를 클릭하지 않았을 때
- 사용자가 오늘 "오늘 하루 보지 않기"를 클릭하지 않았을 때

### 2. 사용자 상호작용

- **닫기**: 팝업을 닫지만 다음 접속 시 다시 표시
- **오늘 하루 보지 않기**: 오늘 하루 동안 팝업을 표시하지 않음
- **다시 보지 않기**: 해당 팝업을 영구적으로 표시하지 않음

### 3. 로컬 스토리지 관리

- `popup_hidden_today_{notice_id}`: 오늘 하루 보지 않기 설정
- `popup_closed_{notice_id}`: 영구적으로 보지 않기 설정

## 파일 구조

```
src/
├── components/
│   ├── NoticePopup.tsx              # 팝업 컴포넌트
│   └── hooks/
│       └── useNoticePopup.tsx       # 팝업 관리 훅
├── app/
│   ├── api/notices/route.ts         # 공지사항 API
│   ├── banner-display/page.tsx      # 현수막게시대 페이지
│   ├── led-display/page.tsx         # LED 전자게시대 페이지
│   ├── digital-signage/page.tsx     # 디지털사이니지 페이지
│   └── public-design/page.tsx       # 공공디자인 페이지
sqls/
├── add_popup_notice_fields.sql      # 스키마 수정 SQL
└── insert_popup_notice_sample_data.sql  # 목데이터 SQL
```

## 주의사항

1. **날짜 형식**: 팝업 날짜는 'YYYY-MM-DD' 형식으로 입력해야 합니다.
2. **팝업 크기**: 너무 큰 팝업은 모바일에서 문제가 될 수 있으므로 적절한 크기로 설정하세요.
3. **로컬 스토리지**: 사용자가 브라우저 데이터를 삭제하면 팝업 설정이 초기화됩니다.
4. **성능**: 팝업은 페이지 로드 시 자동으로 조회되므로, 불필요한 팝업은 비활성화하세요.

## 향후 개선사항

1. **관리자 페이지**: 팝업 공지사항을 관리할 수 있는 관리자 인터페이스
2. **팝업 스케줄링**: 더 세밀한 시간대별 팝업 표시
3. **팝업 통계**: 팝업 클릭률, 표시 횟수 등 통계 기능
4. **A/B 테스트**: 다양한 팝업 디자인 테스트 기능
