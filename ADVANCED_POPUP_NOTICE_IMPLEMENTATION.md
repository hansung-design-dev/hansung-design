# 고급 팝업 공지사항 시스템 구현

## 개요

`panel_popup_notices` 테이블을 사용하여 JSON 구조로 다양한 형태의 팝업 공지사항을 지원하는 시스템을 구현했습니다.

## 주요 특징

### 1. 유연한 JSON 구조

- 다양한 팝업 형태 지원 (체크리스트, 가이드, 공지사항, 커스텀)
- 섹션별 구성으로 복잡한 레이아웃 가능
- 하이라이트, 버튼, 구분선 등 다양한 요소 지원

### 2. 스타일 커스터마이징

- 헤더 색상, 액센트 색상 설정
- 섹션별 배경색, 텍스트 색상 설정
- 반응형 디자인 지원

### 3. 팝업 크기 조절

- `popup_width`, `popup_height` 컬럼으로 크기 설정
- 기본값: 500x400px

## JSON 구조

### 기본 구조

```json
{
  "title": "팝업 제목",
  "contentType": "checklist|guide|notice|custom",
  "style": {
    "headerColor": "#8B4513",
    "accentColor": "#654321"
  },
  "sections": [...],
  "footer": {...}
}
```

### 섹션 타입

#### 1. 체크리스트 (checklist)

```json
{
  "type": "checklist",
  "content": {
    "items": [
      {
        "text": "신청 후 3일이내로 입금해주세요!",
        "highlighted": ["3일이내로"],
        "subItems": [
          "미입금시 통보 후 취소될 수 있습니다.",
          "신청 업체명과 입금자명이 다를경우 연락부탁드립니다."
        ]
      }
    ]
  }
}
```

#### 2. 하이라이트 (highlight)

```json
{
  "type": "highlight",
  "content": {
    "text": "게시대 신청 처음이세요?",
    "highlights": [
      {
        "text": "게시대 신청 처음이세요?",
        "color": "red",
        "bold": true
      }
    ]
  },
  "style": {
    "backgroundColor": "#FEE2E2",
    "textColor": "#DC2626"
  }
}
```

#### 3. 버튼 (button)

```json
{
  "type": "button",
  "content": {
    "text": "신청방법 알아보기!",
    "action": "guide",
    "style": "primary"
  }
}
```

#### 4. 구분선 (divider)

```json
{
  "type": "divider",
  "content": {
    "color": "#E5E7EB",
    "height": 2
  }
}
```

## 구현된 파일들

### 1. 데이터베이스

- `sqls/update_panel_popup_notices.sql` - 테이블 수정
- `sqls/insert_advanced_popup_notice_data.sql` - 목데이터

### 2. 타입 정의

- `src/types/popup-notice.ts` - TypeScript 타입 정의

### 3. 컴포넌트

- `src/components/AdvancedNoticePopup.tsx` - 고급 팝업 컴포넌트

### 4. API

- `src/app/api/panel-popup-notices/route.ts` - 팝업 공지사항 API

### 5. 훅

- `src/components/hooks/useAdvancedNoticePopup.tsx` - 팝업 관리 훅

## 사용 방법

### 1. 데이터베이스 스키마 적용

```sql
-- sqls/update_panel_popup_notices.sql 실행
```

### 2. 목데이터 삽입

```sql
-- sqls/insert_advanced_popup_notice_data.sql 실행
```

### 3. 팝업 공지사항 생성

```javascript
const response = await fetch('/api/panel-popup-notices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    display_category_id: 'banner-display-uuid',
    title: '꼭 확인해주세요!',
    content: {
      title: '꼭 확인해주세요!',
      contentType: 'checklist',
      style: {
        headerColor: '#8B4513',
        accentColor: '#654321',
      },
      sections: [
        {
          type: 'checklist',
          content: {
            items: [
              {
                text: '신청 후 3일이내로 입금해주세요!',
                highlighted: ['3일이내로'],
                subItems: [
                  '미입금시 통보 후 취소될 수 있습니다.',
                  '신청 업체명과 입금자명이 다를경우 연락부탁드립니다.',
                ],
              },
            ],
          },
        },
      ],
      footer: {
        text: '웹하드 hansungad / 23252325',
      },
    },
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    popup_width: 500,
    popup_height: 450,
  }),
});
```

### 4. 페이지에서 사용

```javascript
import AdvancedNoticePopup from '@/src/components/AdvancedNoticePopup';
import { useAdvancedNoticePopup } from '@/src/components/hooks/useAdvancedNoticePopup';

export default function BannerDisplayPage() {
  const { popupNotice, closePopup } = useAdvancedNoticePopup(
    'banner-display-uuid' // display_category_id
  );

  return (
    <main>
      {/* 페이지 내용 */}

      {/* 팝업 공지사항 */}
      {popupNotice && (
        <AdvancedNoticePopup notice={popupNotice} onClose={closePopup} />
      )}
    </main>
  );
}
```

## 팝업 예시

### 1. 체크리스트 팝업

- 이미지의 첫 번째 팝업과 유사
- 체크마크와 하이라이트된 텍스트
- 서브 아이템 지원
- 갈색 테마

### 2. 가이드 팝업

- 이미지의 두 번째 팝업과 유사
- 섹션별 배경색 구분
- 버튼과 하이라이트 텍스트
- 파란색/빨간색 테마

### 3. 공지사항 팝업

- 일반적인 공지사항 형태
- 하이라이트된 날짜/시간
- 구분선과 연락처 정보
- 녹색 테마

### 4. 커스텀 팝업

- 프로젝트 완료 안내
- 다양한 섹션 조합
- 링크 버튼
- 보라색 테마

## 장점

1. **유연성**: JSON 구조로 다양한 팝업 형태 지원
2. **확장성**: 새로운 섹션 타입 쉽게 추가 가능
3. **재사용성**: 컴포넌트와 훅으로 재사용 가능
4. **스타일링**: 섹션별 개별 스타일링 지원
5. **타입 안전성**: TypeScript로 타입 안전성 보장

## 향후 개선사항

1. **관리자 인터페이스**: JSON 편집기 제공
2. **템플릿 시스템**: 자주 사용하는 팝업 형태 템플릿화
3. **애니메이션**: 더 다양한 애니메이션 효과
4. **통계**: 팝업 클릭률, 표시 횟수 등 통계 기능
