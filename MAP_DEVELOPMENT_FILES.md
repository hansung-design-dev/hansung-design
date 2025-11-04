# 지도 개발에 필요한 파일 목록

## 핵심 파일

### 1. 카카오맵 SDK 로더

- **파일**: `src/components/hooks/use-kakao-loader.tsx`
- **역할**: 카카오맵 SDK 스크립트를 동적으로 로드하고 로드 상태를 관리
- **주요 기능**:
  - 카카오맵 SDK 스크립트 동적 로드
  - 로드 상태 추적 (`isLoaded`, `isLoading`)
  - 에러 처리 및 디버깅 로그

### 2. 카카오맵 컴포넌트

- **파일**: `src/components/kakaoMap.tsx`
- **역할**: 실제 지도를 렌더링하고 마커를 표시하는 메인 컴포넌트
- **주요 기능**:
  - 지도 초기화 및 표시
  - 마커 생성 및 관리
  - 로드뷰 오버레이 (모달 형태)
  - 마커 클릭 이벤트 처리

### 3. 지도 타입 정의

- **파일**: `src/types/kakao.d.ts`
- **역할**: 카카오맵 SDK의 TypeScript 타입 정의
- **주요 타입**:
  - `Window.kakao.maps` 타입 정의
  - `LatLng`, `Map`, `Marker`, `Roadview` 등

## 페이지 파일

### 4. 구별 상세 페이지

- **파일**: `src/app/banner-display/[district]/page.tsx`
- **역할**: 특정 구의 현수막 게시대 목록을 표시하고 API 호출
- **주요 기능**:
  - 구별 데이터 API 호출
  - 지도와 리스트 뷰 전환
  - 기간 데이터 조회

### 5. 디스플레이 상세 페이지 컴포넌트

- **파일**: `src/components/displayDetailPage.tsx`
- **역할**: 지도, 갤러리, 리스트 뷰를 제공하는 통합 컴포넌트
- **주요 기능**:
  - 뷰 타입 전환 (location/gallery/list)
  - `KakaoMap` 컴포넌트 사용
  - 마커 데이터 전달

## API 파일

### 6. 배너 디스플레이 API

- **파일**: `src/app/api/banner-display/route.ts`
- **역할**: 현수막 게시대 데이터를 제공하는 API 엔드포인트
- **주요 기능**:
  - 구별 데이터 조회
  - 캐시 테이블 활용
  - 가격 정책 조회

### 7. 기간 조회 API

- **파일**: `src/app/api/display-period/route.ts`
- **역할**: 신청 가능한 기간 정보를 제공
- **주요 기능**:
  - 구별 신청 기간 조회
  - 반기별 기간 정보

## 설정 파일

### 8. Next.js 설정

- **파일**: `next.config.ts`
- **역할**: 카카오맵을 위한 CSP 헤더 설정
- **주요 설정**:
  - `frame-src`: 카카오 도메인 허용
  - `script-src`: 카카오 스크립트 허용
  - `connect-src`: 카카오 API 연결 허용

### 9. 환경 변수 설정

- **파일**: `.env.local`
- **역할**: 카카오맵 API 키 설정
- **필수 환경 변수**:
  ```bash
  NEXT_PUBLIC_KAKAO_KEY=your_kakao_map_javascript_key
  ```

## 설정 가이드

### 10. 카카오맵 설정 가이드

- **파일**: `KAKAO_MAP_SETUP.md`
- **역할**: 카카오맵 설정 방법 안내
- **주요 내용**:
  - API 키 발급 방법
  - 플랫폼 등록 방법
  - 문제 해결 가이드

## 데이터 타입 파일

### 11. 디스플레이 타입 정의

- **파일**: `src/types/displaydetail.ts`
- **역할**: 지도에서 사용하는 데이터 타입 정의
- **주요 타입**:
  - `BannerBillboard`
  - `DisplayBillboard`
  - `District`
  - `MarkerType`

## 사용 흐름

1. **페이지 접속** → `banner-display/[district]/page.tsx`
2. **데이터 로드** → API 호출 (`/api/banner-display`)
3. **컴포넌트 렌더링** → `DisplayDetailPage` 컴포넌트
4. **지도 표시** → `KakaoMap` 컴포넌트
5. **SDK 로드** → `useKakaoLoader` 훅

## 디버깅 팁

### API 호출이 안 보일 때:

1. 브라우저 콘솔에서 다음 로그 확인:

   - `🔍 useEffect 실행됨`
   - `🔍 Starting to fetch banner data...`
   - `🔍 API URL:`
   - `🔍 API 호출 시작 시간:`

2. Network 탭에서 다음 요청 확인:

   - `/api/banner-display?action=...`
   - `/api/display-period?district=...`

3. 카카오맵 SDK 로드 확인:
   - `🔍 카카오맵 SDK 로드 시도`
   - `dapi.kakao.com` 요청 확인

### 카카오맵이 안 보일 때:

1. 카카오 개발자 콘솔에서 확인:

   - JavaScript 키가 올바른지
   - Web 플랫폼이 등록되어 있는지
   - 사이트 도메인이 등록되어 있는지 (`http://localhost:3000`)

2. 브라우저 콘솔에서 확인:
   - `❌ 카카오맵 SDK 스크립트 로드 실패` 에러 확인
   - Network 탭에서 `dapi.kakao.com` 요청 상태 확인

## 주요 개선 사항

### 최근 추가된 디버깅 로그:

- `useEffect` 실행 확인 로그
- API 호출 시작/종료 시간 로그
- API URL 로그
- 응답 상태 로그
- `districtName` 유효성 검사 로그

이 로그들을 통해 API 호출이 발생하지 않는 원인을 쉽게 파악할 수 있습니다.
