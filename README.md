# 한성웹 프로젝트

## 최근 업데이트

### 게첨사진 기능 추가 (2024년)

- 고객지원 페이지에 게첨사진 탭 추가
- 현수막게시대, LED전자게시대, 디지털사이니지 설치 완료 사진 관리
- 분기별 설치 현황을 고객에게 공개
- 아코디언 형태의 UI로 사진과 상세 정보 표시

### 주요 기능

- 게첨사진 조회 API (`/api/installation-photos`)
- 디스플레이 타입별 필터링
- 마크다운 형식의 내용 지원
- 반응형 이미지 표시

### 데이터베이스 스키마

```sql
-- 게첨사진 테이블
CREATE TABLE installed_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_type_id UUID NOT NULL REFERENCES display_types(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    photo_urls TEXT[] NOT NULL, -- 여러 사진 URL 배열
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

# 한성디자인 웹사이트

한성디자인의 LED 디스플레이 및 배너 광고 서비스 웹사이트입니다.

## 주요 기능

### 1. 디스플레이 서비스

- **LED 디스플레이**: 실시간 LED 패널 정보 및 가격 조회
- **배너 디스플레이**: 배너 패널 정보 및 슬롯별 가격 조회
- **디지털 사이니지**: 디지털 사이니지 패널 정보
- **공공디자인**: 공공디자인 패널 정보

### 2. 사용자 인증 시스템

- **회원가입**: 이메일 기반 회원가입 (Supabase Auth)
- **로그인/로그아웃**: JWT 토큰 기반 인증
- **사용자 프로필**: 사용자 정보 관리

### 3. 마이페이지 기능

- **주문내역**: 사용자별 주문 내역 조회 및 상태 관리
- **1:1 상담**: 상담 문의 작성 및 답변 조회
- **간편정보관리**: 사용자 정보 관리

### 4. 장바구니 및 결제

- **장바구니**: 선택한 패널을 장바구니에 추가
- **결제 시스템**: 주문 생성 및 결제 처리

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## 데이터베이스 스키마

### 사용자 관련 테이블

- `users`: 사용자 프로필 정보
- `orders`: 주문 정보
- `order_items`: 주문 상세 아이템
- `customer_service`: 1:1 상담 문의

### 디스플레이 관련 테이블

- `panel_info`: 패널 기본 정보
- `banner_panel_details`: 배너 패널 상세 정보
- `banner_slot_info`: 배너 슬롯 정보
- `region_gu`: 구 정보
- `region_dong`: 동 정보
- `display_types`: 디스플레이 타입
- `bank_info`: 은행 계좌 정보

## 설치 및 실행

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 데이터베이스 설정

Supabase에서 다음 SQL 스크립트를 실행하여 테이블을 생성합니다:

```sql
-- users 테이블 생성
-- supabase-migrations/create_users_table.sql 실행

-- 주문 및 상담 테이블 생성
-- supabase-migrations/create_orders_table.sql 실행
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## API 엔드포인트

### 인증 API

- `POST /api/auth/signup`: 회원가입
- `POST /api/auth/signin`: 로그인
- `POST /api/auth/signout`: 로그아웃

### 주문 API

- `GET /api/orders`: 주문 내역 조회
- `POST /api/orders`: 주문 생성

### 상담 API

- `GET /api/customer-service`: 상담 내역 조회
- `POST /api/customer-service`: 상담 문의 생성

### 디스플레이 API

- `GET /api/region-gu`: 지역별 패널 정보 조회
- `GET /api/led-display`: LED 디스플레이 정보 조회
- `GET /api/banner-display`: 배너 디스플레이 정보 조회

## 테스트

테스트 페이지를 통해 기능을 확인할 수 있습니다:

- `/test-order`: 테스트 주문 및 상담 문의 생성

## 주요 컴포넌트

### 인증 관련

- `AuthProvider`: 전역 인증 상태 관리
- `useAuth`: 인증 훅

### 마이페이지 관련

- `MypageContainer`: 마이페이지 레이아웃
- `OrderItemList`: 주문 내역 목록
- `CustomerServicePage`: 1:1 상담 페이지

### 디스플레이 관련

- `DistrictCard`: 지역별 패널 카드
- `BannerPeriod`: 배너 기간 표시
- `BankInfo`: 은행 계좌 정보 표시

## 개발 가이드

### 새로운 기능 추가

1. API 엔드포인트 생성 (`src/app/api/`)
2. 타입 정의 (`src/lib/supabase.ts`)
3. 컴포넌트 생성 (`src/components/`)
4. 페이지 생성 (`src/app/`)

### 데이터베이스 변경

1. 마이그레이션 파일 생성 (`supabase-migrations/`)
2. Supabase에서 SQL 실행
3. 타입 정의 업데이트

## 배포

Vercel을 통한 배포를 권장합니다:

1. GitHub 저장소 연결
2. 환경변수 설정
3. 자동 배포 설정

## 라이선스

이 프로젝트는 한성디자인의 내부 프로젝트입니다.
