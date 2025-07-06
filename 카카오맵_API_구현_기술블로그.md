# 카카오맵 API를 활용한 LED 전자게시대 위치 표시 기능 구현

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [구현 과정](#구현-과정)
4. [핵심 기능](#핵심-기능)
5. [코드 분석](#코드-분석)
6. [문제 해결 과정](#문제-해결-과정)
7. [최종 결과](#최종-결과)
8. [학습 포인트](#학습-포인트)

---

## 🎯 프로젝트 개요

### 프로젝트 목표

- LED 전자게시대의 위치를 지도에 시각적으로 표시
- 사용자가 아이템을 선택하면 해당 위치로 지도가 이동하는 인터랙티브 기능 구현
- 단일 선택 기반의 직관적인 UI/UX 제공

### 주요 요구사항

1. **단일 선택**: 한 번에 하나의 아이템만 선택 가능
2. **동적 지도 이동**: 선택된 아이템의 위치로 지도 중심점 이동
3. **마커 표시**: 선택된 아이템만 지도에 마커로 표시
4. **반응형 디자인**: 다양한 화면 크기에 대응

---

## 🛠️ 기술 스택

### Frontend

- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 확보
- **Next.js 14** - 서버 사이드 렌더링 및 라우팅
- **Tailwind CSS** - 스타일링

### 지도 API

- **react-kakao-maps-sdk** - 카카오맵 React 컴포넌트
- **Kakao Maps JavaScript API** - 지도 및 마커 기능

### 상태 관리

- **React Context API** - 전역 상태 관리
- **useState, useEffect** - 로컬 상태 관리

---

## 🔧 구현 과정

### 1단계: 프로젝트 설정 및 라이브러리 설치

```bash
# 카카오맵 SDK 설치
npm install react-kakao-maps-sdk

# 타입 정의 확인
npm install @types/kakao-maps
```

### 2단계: 기본 지도 컴포넌트 구현

```typescript
// src/components/kakaoMap.tsx
import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from './hooks/use-kakao-loader';

export interface MarkerType {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  isSelected?: boolean;
}

interface KakaoMapProps {
  markers: MarkerType[];
  selectedIds: string[];
  center?: { lat: number; lng: number };
}
```

### 3단계: SDK 로딩 및 에러 처리

```typescript
const KakaoMap: React.FC<KakaoMapProps> = ({ markers, selectedIds, center }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useKakaoLoader();

  useEffect(() => {
    const checkKakaoMapLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        console.log('KakaoMap SDK 로딩 성공');
      } else {
        setTimeout(checkKakaoMapLoaded, 100);
      }
    };

    checkKakaoMapLoaded();

    // 10초 타임아웃 설정
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        setError('카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.');
        console.error('KakaoMap SDK 로딩 실패');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);
```

### 4단계: 동적 중심점 계산

```typescript
// 중심점 계산: props로 받은 center가 있으면 사용, 없으면 마커들의 중심점 계산
const mapCenter =
  center ||
  (markers.length
    ? {
        lat:
          markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length,
        lng:
          markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length,
      }
    : { lat: 37.5665, lng: 126.978 }); // 서울시청 기본값
```

### 5단계: 커스텀 마커 구현

```typescript
return (
  <Map center={mapCenter} style={{ width: '100%', height: '100%' }} level={3}>
    {markers.map((marker) => {
      return (
        <MapMarker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
        >
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: selectedIds.includes(marker.id)
                ? '#238CFA'
                : '#666',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              minWidth: '60px',
              textAlign: 'center',
            }}
          >
            {marker.title.length > 10
              ? marker.title.substring(0, 10) + '...'
              : marker.title}
          </div>
        </MapMarker>
      );
    })}
  </Map>
);
```

---

## ⭐ 핵심 기능

### 1. 단일 선택 시스템

```typescript
// 지도 뷰에서 아이템 클릭 시 단일 선택 로직
onClick={() => {
  if (isSelected) {
    // 이미 선택된 아이템을 클릭하면 선택 해제
    setSelectedIds([]);
  } else {
    // 새로운 아이템을 선택하면 이전 선택을 모두 해제하고 새 아이템만 선택
    setSelectedIds([item.id]);
  }
}}
```

### 2. 동적 마커 표시

```typescript
// 선택된 아이템만 지도에 표시 (단일 선택)
const mapMarkers =
  selectedItem &&
  selectedItem.latitude != null &&
  selectedItem.longitude != null
    ? [
        {
          id: selectedItem.id,
          title: selectedItem.name,
          lat: selectedItem.latitude!,
          lng: selectedItem.longitude!,
          type: selectedItem.type,
          isSelected: true,
        },
      ]
    : [];
```

### 3. 지도 중심점 동적 변경

```typescript
// 지도 중심점: 선택된 아이템이 있으면 해당 위치, 없으면 모든 아이템의 중심
const mapCenter =
  selectedItem &&
  selectedItem.latitude != null &&
  selectedItem.longitude != null
    ? { lat: selectedItem.latitude, lng: selectedItem.longitude }
    : filteredBillboards.length > 0
    ? {
        lat:
          filteredBillboards.reduce((sum, b) => sum + (b.latitude || 0), 0) /
          filteredBillboards.length,
        lng:
          filteredBillboards.reduce((sum, b) => sum + (b.longitude || 0), 0) /
          filteredBillboards.length,
      }
    : { lat: 37.5665, lng: 126.978 };
```

---

## 📊 코드 분석

### 컴포넌트 구조

```
LEDDisplayDetailPage
├── KakaoMap (지도 컴포넌트)
│   ├── Map (지도 컨테이너)
│   └── MapMarker (마커들)
├── 아이템 리스트 (왼쪽)
└── 뷰 타입 선택기 (상단)
```

### 상태 관리

```typescript
// 주요 상태들
const [selectedIds, setSelectedIds] = useState<string[]>([]); // 선택된 아이템 ID들
const [viewType, setViewType] = useState<'location' | 'gallery' | 'list'>(
  'gallery'
);
```

### 데이터 플로우

1. **API 호출** → LED 전자게시대 데이터 가져오기
2. **데이터 변환** → API 응답을 프론트엔드 형식으로 변환
3. **상태 업데이트** → 선택된 아이템에 따라 상태 변경
4. **지도 렌더링** → 선택된 아이템의 위치로 지도 업데이트

---

## 🔍 문제 해결 과정

### 1. 좌표 데이터 매핑 문제

**문제**: API에서 받아온 좌표 데이터가 `undefined`로 표시됨

**원인**: 데이터베이스 컬럼명과 프론트엔드 필드명 불일치

- DB: `latitude`, `longitude`
- 프론트엔드: `lat`, `lng`

**해결**: API 쿼리와 타입 정의 수정

```typescript
// API 쿼리 수정
.select(`
  id,
  panel_code,
  nickname,
  address,
  panel_status,
  panel_type,
  latitude,  // 추가
  longitude, // 추가
  // ... 기타 필드들
`)

// 타입 정의 수정
export interface LEDDisplayData {
  // ... 기타 필드들
  latitude: number;
  longitude: number;
}
```

### 2. 마커 이미지 파일 누락

**문제**: 마커가 지도에 표시되지 않음

**원인**: `/images/pos.png`, `/images/pos_sel.png` 파일이 존재하지 않음

**해결**: 커스텀 텍스트 기반 마커로 변경

```typescript
// 이미지 기반 마커 대신 커스텀 div 사용
<MapMarker position={{ lat: marker.lat, lng: marker.lng }}>
  <div
    style={{
      padding: '8px 12px',
      backgroundColor: selectedIds.includes(marker.id) ? '#238CFA' : '#666',
      color: 'white',
      borderRadius: '4px',
      // ... 기타 스타일
    }}
  >
    {marker.title}
  </div>
</MapMarker>
```

### 3. 단일 선택 로직 구현

**문제**: 멀티 선택이 아닌 단일 선택이 필요함

**해결**: 선택 로직을 직접 구현

```typescript
// 기존: handleItemSelect 사용 (멀티 선택)
// 수정: 직접 setSelectedIds 사용 (단일 선택)
if (isSelected) {
  setSelectedIds([]); // 선택 해제
} else {
  setSelectedIds([item.id]); // 새 아이템만 선택
}
```

---

## 🎉 최종 결과

### 구현된 기능들

✅ **단일 선택 시스템**: 한 번에 하나의 아이템만 선택 가능  
✅ **동적 지도 이동**: 선택된 아이템의 위치로 지도 중심점 이동  
✅ **커스텀 마커**: 텍스트 기반의 시각적으로 구분되는 마커  
✅ **반응형 디자인**: 다양한 화면 크기에 대응  
✅ **에러 처리**: SDK 로딩 실패 시 적절한 에러 메시지 표시  
✅ **성능 최적화**: 불필요한 리렌더링 방지

### 사용자 경험

1. **직관적인 인터페이스**: 아이템 클릭 → 지도 이동
2. **시각적 피드백**: 선택된 아이템과 마커 색상 변경
3. **빠른 반응**: 즉시 지도 중심점 변경
4. **일관된 동작**: 모든 뷰에서 동일한 선택 로직

---

## 📚 학습 포인트

### 1. 카카오맵 API 활용법

- **react-kakao-maps-sdk** 라이브러리의 효과적인 사용법
- **Map**과 **MapMarker** 컴포넌트의 props 활용
- **동적 중심점** 계산 및 적용 방법

### 2. React 상태 관리

- **단일 선택** 로직의 효율적인 구현
- **상태 업데이트** 최적화
- **컴포넌트 간 데이터 전달** 방법

### 3. TypeScript 활용

- **인터페이스 정의**를 통한 타입 안정성 확보
- **API 응답 데이터**의 타입 매핑
- **컴포넌트 Props** 타입 정의

### 4. 문제 해결 능력

- **디버깅 로그** 활용법
- **단계별 문제 분석** 방법
- **대안적 해결책** 모색 능력

---

## 🔗 참고 자료

- [Kakao Maps JavaScript API 공식 문서](https://apis.map.kakao.com/web/)
- [react-kakao-maps-sdk GitHub](https://github.com/JaeSeoKim/react-kakao-maps-sdk)
- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

---

## 📝 마무리

이번 프로젝트를 통해 카카오맵 API의 활용법과 React에서의 상태 관리, 그리고 사용자 경험을 고려한 인터랙티브 기능 구현에 대해 깊이 있게 학습할 수 있었습니다.

특히 **단일 선택 시스템**과 **동적 지도 이동** 기능을 구현하면서, 사용자의 의도를 정확히 파악하고 이를 기술적으로 구현하는 과정에서 많은 인사이트를 얻을 수 있었습니다.

앞으로도 더 나은 사용자 경험을 제공하는 기능들을 구현해 나가겠습니다! 🚀

---

_작성일: 2024년 12월_  
_작성자: [작성자명]_  
_기술 스택: React, TypeScript, Next.js, Kakao Maps API_
